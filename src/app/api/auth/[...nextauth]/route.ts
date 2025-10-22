// WAJIB: Paksa route NextAuth ke Node.js runtime (bukan Edge)
export const runtime = 'nodejs';

// Opsional tapi membantu agar tidak distatic-kan
export const dynamic = 'force-dynamic';

import { handlers } from "~/server/auth";

export const { GET, POST } = handlers;
