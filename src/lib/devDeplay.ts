export async function devDeplay(ms: number) {
    if (process.env.NODE_ENV === "development") {
        await new Promise((r) => setTimeout(r, ms));
    }
}