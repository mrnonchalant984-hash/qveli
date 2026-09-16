import { NextResponse } from "next/server";
export function ok(data: unknown, init?: ResponseInit) { return NextResponse.json(data, { status: 200, ...init }); }
export function created(data: unknown) { return NextResponse.json(data, { status: 201 }); }
export function bad(message: string, status = 400) { return NextResponse.json({ error: message }, { status }); }
export function unauthorized(message = "Authentication required") { return bad(message, 401); }
export function notFound(message = "Not found") { return bad(message, 404); }
export function serverError(message = "Something went wrong on the server") { return bad(message, 500); }
