import { NextRequest, NextResponse } from "next/server";
import { PrimeSieve } from "validator/helpers/primes-helper";

export const POST = async (input: NextRequest) => {
  const jsonResult = (await input.json()) as number[];
  const currentDate = new Date().getTime();
  const hackathonDate = new Date("2023-06-29T15:00:00.000+02:00").getTime();
  if (currentDate < hackathonDate) {
    const timeToContest = (hackathonDate - currentDate) / 1000 / 60 / 60;
    if (jsonResult?.length > 0) {
      return NextResponse.json({
        success: true,
        message: `validation will open in ${timeToContest.toFixed(2)} hours`,
      });
    }
    return NextResponse.json({
      success: false,
      message: `validation will open in ${timeToContest.toFixed(2)} hours`,
    });
  }

  const sieve = new PrimeSieve(1_000_000).runSieve();
  const primes = sieve.getPrimes(1_000_000);

  if (jsonResult?.length != primes.length) {
    return NextResponse.error();
  }
  const test = primes.every((prime) =>
    jsonResult.find((suspectedPrime) => suspectedPrime === prime)
  );
  if (!test) {
    return NextResponse.error();
  }
  return NextResponse.json({ success: true });
};
