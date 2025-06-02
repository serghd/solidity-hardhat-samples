import dayjs from "dayjs";

export function consoleLog(...msg: any[]) {
   const date = dayjs().format("YYYY-MM-DD HH:mm:ss");
   console.log(`[${date}]`, ...msg);
}
