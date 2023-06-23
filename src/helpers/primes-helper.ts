const NOW_UNITS_PER_SECOND = 1000;
const WORD_SIZE = 32;

export class PrimeSieve
{
    sieveSize: number;
    sieveSizeInBits: number;
    bitArray: BitArray;
	constructor(sieveSize: number)
	{
		this.sieveSize = sieveSize;
		this.sieveSizeInBits = sieveSize >>> 1;
		this.bitArray = new BitArray(1 + this.sieveSizeInBits);
	}

	runSieve()
	{
		const q = Math.ceil(Math.sqrt(this.sieveSizeInBits));  // convert to integer with ceil
		let factor = 1;

		while (factor < q)
		{
			const step = factor * 2 + 1;
			const start = factor * factor * 2 + factor + factor;

			this.bitArray.setBitsTrue(start, step, this.sieveSizeInBits); // mark every multiple of this prime
			factor = this.bitArray.searchBitFalse(factor + 1);
		}
		return this;
	}

	countPrimes()
	{
		let total = 1;  // account for prime 2
		for (let index = 1; index < this.sieveSizeInBits; index++)
		{
			if (!this.bitArray.testBitTrue(index))  // if bit is false, it's a prime, because non-primes are marked true
			{
				total++;
			}
		}
		return total;
	}

	getPrimes(max = 100)
	{
		const primes = [2];  // 2 is a special prime
		for (let factor = 1, count = 0; factor < this.sieveSizeInBits; factor++)
		{
			if (count >= max) break;
			if (!this.bitArray.testBitTrue(factor)) count = primes.push(factor * 2 + 1);
		}
		return primes;
	}

	validatePrimeCount(verbose: boolean) 
	{
		// Historical data for validating our results - the number of primes
		// to be found under some limit, such as 168 primes under 1000
		const maxShowPrimes = 100;
		const knownPrimeCounts = {
			10: 4,
			100: 25,
			1000: 168,
			10000: 1229,
			100000: 9592,
			1000000: 78498,
			10000000: 664579,
			100000000: 5761455
		};
		const countedPrimes = this.countPrimes();
		const primeArray = this.getPrimes(maxShowPrimes);

		let validResult = false;
		if (this.sieveSize in knownPrimeCounts)
		{
			const knownPrimeCount = 78498;
			validResult = (knownPrimeCount == countedPrimes);
			if (!validResult)
				console.log(
					"\nError: invalid result.",
					`Limit for ${this.sieveSize} should be ${knownPrimeCount} `,
					`but result contains ${countedPrimes} primes`
				);
		}
		else console.log(
			`Warning: cannot validate result of ${countedPrimes} primes:`,
			`limit ${this.sieveSize} is not in the known list of number of primes!`
		);

		if (verbose)
			console.log(`\nThe first ${maxShowPrimes} found primes are:`, primeArray);
	
		return validResult;
	}
}

class BitArray
{
    wordArray: Int32Array;
	constructor(size: number)
	{
		this.wordArray = new Int32Array(1 + (size >>> 5));  // allocation in javascript is with 0
	}

	setBitTrue(index: number)
	{
		const wordOffset = index >>> 5;  // 1 word = 2ˆ5 = 32 bit, so shift 5, much faster than /32
		const bitOffset = index & 31;  // use & (and) for remainder, faster than modulus of /32
		this.wordArray[wordOffset] |= (1 << bitOffset);
	}

	setBitsTrue(range_start: number, step: number, range_stop: number) {
		if (step > WORD_SIZE/2) { 
			// steps are large: check if the range is large enough to reuse the same mask
			let range_stop_unique =  range_start + 32 * step;
			if (range_stop_unique > range_stop) {
				// range is not large enough for repetition (32 * step)
				for (let index = range_start; index < range_stop; index += step) {
					this.setBitTrue(index);
				}
				return;
			}
			// range is large enough to reuse the mask
			const range_stop_word = range_stop >>> 5;
			for (let index = range_start; index < range_stop_unique; index += step) {
				let wordOffset = index >>> 5;
				const bitOffset = index & 31;
				const mask = (1 << bitOffset);
				do {
					this.wordArray[wordOffset] |= mask;
					wordOffset += step; // pattern repeats on word level after {step} words
				} while (wordOffset <= range_stop_word);
			}
			return;
		}

		// optimized for small sizes: set wordvalue multiple times before committing to memory
		let index = range_start;
		let wordOffset = index >>> 5;  // 1 word = 2ˆ5 = 32 bit, so shift 5, much faster than /32
		let wordValue = this.wordArray[wordOffset];

		while (index < range_stop) {
			const bitOffset = index & 31;  // use & (and) for remainder, faster than modulus of /32
			wordValue |= (1 << bitOffset);

			index += step;
			const newwordOffset = index >>> 5;  // 1 word = 2ˆ5 = 32 bit, so shift 5, much faster than /32
			if (newwordOffset != wordOffset) { // moving to new word: store value and get new value
				this.wordArray[wordOffset] = wordValue;
				wordOffset = newwordOffset;
				wordValue = this.wordArray[wordOffset];
			}
		}
		this.wordArray[wordOffset] = wordValue; // make sure last value is stored
	}

	testBitTrue(index: number)
	{
		const wordOffset = index >>> 5;
		const bitOffset = index & 31;
		return this.wordArray[wordOffset] & (1 << bitOffset); // use a mask to only get the bit at position bitOffset. >0=true, 0=false
	}

	searchBitFalse(index: number)
	{
		while (this.testBitTrue(index)) { index++ };  // will stop automatically because bits were 0 filled
		return index;
	}
}