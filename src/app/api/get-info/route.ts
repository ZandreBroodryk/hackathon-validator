import { NextRequest, NextResponse } from "next/server";
import { PrimeSieve } from "validator/helpers/primes-helper";

export const GET = async () => {
  const sieve = new PrimeSieve(1_000_000).runSieve();
  const primes = sieve.getPrimes(1_000_000);

  return NextResponse.json({ numberOfPrimes: primes.length, primes: primes });
};
