export async function readJson<T>(request: Request): Promise<T | null> {
    try {
        return (await request.json()) as T;
    } catch {
        return null;
    }
}

export function jsonError(message: string, status = 400) {
    return Response.json({ error: message }, { status });
}

export function optionalString(value: unknown, max = 2000): string | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, max) : null;
}
