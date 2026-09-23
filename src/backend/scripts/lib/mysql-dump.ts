/**
 * Minimal parser for phpMyAdmin / mysqldump INSERT statements.
 * Returns every row of a table as an object keyed by column name.
 */

export type SqlValue = string | number | null;
export type SqlRow = Record<string, SqlValue>;

const UNESCAPE: Record<string, string> = { n: "\n", r: "\r", t: "\t", "0": "\0", Z: "\x1a" };

export function extractTableRows(dump: string, table: string): SqlRow[] {
    const rows: SqlRow[] = [];
    const header = `INSERT INTO \`${table}\` (`;
    let from = 0;

    while (true) {
        const start = dump.indexOf(header, from);
        if (start === -1) break;

        const colsEnd = dump.indexOf(") VALUES", start);
        const columns = dump
            .slice(start + header.length, colsEnd)
            .split(",")
            .map(c => c.trim().replace(/`/g, ""));

        const { tuples, end } = parseTuples(dump, colsEnd + ") VALUES".length);
        for (const tuple of tuples) {
            const row: SqlRow = {};
            columns.forEach((col, i) => (row[col] = tuple[i] ?? null));
            rows.push(row);
        }
        from = end;
    }

    return rows;
}

function parseTuples(src: string, pos: number): { tuples: SqlValue[][]; end: number } {
    const tuples: SqlValue[][] = [];
    let i = pos;

    while (i < src.length) {
        const ch = src[i];
        if (ch === ";") return { tuples, end: i + 1 };
        if (ch !== "(") {
            i++;
            continue;
        }

        i++;
        const values: SqlValue[] = [];
        while (true) {
            while (src[i] === " " || src[i] === "\n" || src[i] === "\r") i++;

            if (src[i] === "'") {
                i++;
                let out = "";
                while (true) {
                    const c = src[i];
                    if (c === "\\") {
                        const next = src[i + 1];
                        out += UNESCAPE[next] ?? next;
                        i += 2;
                    } else if (c === "'" && src[i + 1] === "'") {
                        out += "'";
                        i += 2;
                    } else if (c === "'") {
                        i++;
                        break;
                    } else {
                        out += c;
                        i++;
                    }
                }
                values.push(out);
            } else {
                let raw = "";
                while (src[i] !== "," && src[i] !== ")") raw += src[i++];
                raw = raw.trim();
                values.push(raw === "NULL" ? null : Number.isNaN(Number(raw)) ? raw : Number(raw));
            }

            while (src[i] === " ") i++;
            if (src[i] === ",") {
                i++;
                continue;
            }
            if (src[i] === ")") {
                i++;
                break;
            }
        }
        tuples.push(values);
    }

    return { tuples, end: i };
}
