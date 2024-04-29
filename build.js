import { readLines } from "https://deno.land/std/io/mod.ts";
import { YomiDict } from "https://raw.githubusercontent.com/marmooo/yomi-dict/v0.1.7/mod.js";
import { Database } from "https://deno.land/x/sqlite3@0.11.1/mod.ts";
import { Kanji, JKAT } from "npm:@marmooo/kanji@0.0.8";

async function getGradedWords(filepath, threshold) {
  const examples = [];
  const fileReader = await Deno.open(filepath);
  for await (const line of readLines(fileReader)) {
    if (!line) continue;
    const arr = line.split(",");
    const word = arr[0];
    const count = parseInt(arr[1]);
    if (count >= threshold) {
      examples.push(word);
    }
  }
  return examples;
}

async function getGradedVocab(grade, threshold) {
  const filepath = "graded-vocab-ja/dist/" + grade + ".csv";
  return await getGradedWords(filepath, threshold);
}

async function getGradedIdioms(grade, threshold) {
  const filepath = "graded-idioms-ja/dist/" + grade + ".csv";
  return await getGradedWords(filepath, threshold);
}

function normalizeDakuon(yomi) {
  return Array.from(yomi).map((str) => str.normalize("NFD")[0]).join("");
}

function calcEditDistance(from, to) {
  let count = 0;
  for (let i = 0; i < from.length; i++) {
    if (from[i] != to[i]) count += 1;
  }
  return count;
}

function removeDakuon(yomis) {
  const tmpYomis = yomis.map((yomi, i) => {
    const normalized = normalizeDakuon(yomi);
    const diff = calcEditDistance(yomi, normalized);
    return [i, normalized, diff];
  });
  const tmpDict = {};
  tmpYomis.forEach((data) => {
    const [i, yomi, diff] = data;
    if (yomi in tmpDict) {
      const diffPrev = tmpDict[yomi][1];
      if (diff < diffPrev) {
        tmpDict[yomi] = [i, diff];
      }
    } else {
      tmpDict[yomi] = [i, diff];
    }
  });
  return Object.values(tmpDict).map((x) => yomis[x[0]]);
}

async function build(threshold) {
  const jkat = new Kanji(JKAT);
  const wncc = new Database("wncc-ja/remote.db");
  const getCollocation = wncc.prepare(`
    SELECT words FROM collocations WHERE lemma = ?
  `);
  const yomiDict = await YomiDict.load("yomi-dict/yomi.csv");
  for (let grade = 1; grade <= 12; grade++) {
    const result = {};
    let words = [];
    const vocab = await getGradedVocab(grade, threshold);
    const idioms = await getGradedIdioms(grade, threshold);
    words.push(...vocab);
    words.push(...idioms);
    words = [...new Set(words)];
    for (const word of words) {
      let yomis = yomiDict.get(word);
      if (!yomis) continue;
      yomis = yomis.filter((yomi) => yomi.at(-1) != "っ");
      yomis = removeDakuon(yomis);
      if (yomis.length > 1) continue;
      const yomi = yomis[0];
      const row = getCollocation.values([word]);
      if (row.length > 0) {
        const collocations = JSON.parse(row);
        const cs = collocations
          // .filter((x) => x.match(/.* [がのをにとへ] .*/))
          .filter((x) => {
            // 意味が薄い名詞を削除
            if (x.startsWith("これ ")) return false;
            if (x.startsWith("この ")) return false;
            if (x.startsWith("こう ")) return false;
            if (x.startsWith("それ ")) return false;
            if (x.startsWith("その ")) return false;
            if (x.startsWith("そう ")) return false;
            if (x.startsWith("あれ ")) return false;
            if (x.startsWith("あの ")) return false;
            if (x.startsWith("ある ")) return false;
            if (x.startsWith("どれ ")) return false;
            if (x.startsWith("どの ")) return false;
            if (x.startsWith("どう ")) return false;
            if (x.startsWith("為 ")) return false;
            if (x.startsWith("ため ")) return false;
            if (x.startsWith("事 ")) return false;
            if (x.startsWith("こと ")) return false;
            if (x.startsWith("人 ")) return false;
            if (x.startsWith("ひと ")) return false;
            if (x.startsWith("者 ")) return false;
            if (x.startsWith("もの ")) return false;
            if (x.startsWith("方 ")) return false;
            if (x.startsWith("ほう ")) return false;
            if (x.startsWith("日 ")) return false;
            if (x.startsWith("業 ")) return false;
            if (x.startsWith("所 ")) return false;
            if (x.startsWith("ところ ")) return false;
            if (x.startsWith("何 ")) return false;
            if (x.startsWith("化 ")) return false;
            if (x.startsWith("等 ")) return false;
            if (x.startsWith("回 ")) return false;
            if (x.startsWith("など ")) return false;

            // その他の意味が薄い品詞を削除
            // ば 何事, ば 具体, ため の 具体, よう な 具体
            if (x.match(/^[ぁ-ん]+ /)) return false;
            if (x.startsWith("する ")) return false;
            if (x.startsWith("ない ")) return false;

            // 意味が薄い名詞を削除
            if (x.endsWith(" 為")) return false;
            if (x.endsWith(" ため")) return false;
            if (x.endsWith(" 事")) return false;
            if (x.endsWith(" こと")) return false;
            if (x.endsWith(" 人")) return false;
            if (x.endsWith(" ひと")) return false;
            if (x.endsWith(" 者")) return false;
            if (x.endsWith(" もの")) return false;
            if (x.endsWith(" 日")) return false;
            if (x.endsWith(" 業")) return false;
            if (x.endsWith(" 方")) return false;
            if (x.endsWith(" ほう")) return false;
            if (x.endsWith(" 何")) return false;
            if (x.endsWith(" 化")) return false;
            if (x.endsWith(" 等")) return false;
            if (x.endsWith(" 回")) return false;
            if (x.endsWith(" など")) return false;

            // その他の意味が薄い品詞を削除
            if (x.endsWith(" もの")) return false;
            // TODO: wncc-ja で対処すべきかも
            if (x.endsWith(" よう")) return false;
            if (x.endsWith(" そう")) return false;
            return true;
          })
          .map((x) => x.replace(/ /g, ""))
          .filter((x) => grade >= jkat.getGrade(x))
          .slice(0, 5).join(",");
        result[word] = `${yomi},${cs}`;
      }
    }
    const outPath = "src/data/" + grade + ".csv";
    Deno.writeTextFileSync(outPath, Object.entries(result).join("\n"));
  }
}

const threshold = 100000;
await build(threshold);
