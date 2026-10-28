import type {
  AlgorithmDefinition,
  Step,
  PseudocodeLine,
  ComplexityMetric,
} from '../../types/algorithm';
import type {
  HashOperationInput,
  HashSnapshot,
  HashEntry,
  TableSlot,
} from '../../types/hash';
import { computeHash } from './hashFunctions';

const hashPseudocode: PseudocodeLine[] = [
  { line: 1, code: 'function hashOperation(key, type):', explanation: 'Hash Table with collision resolution' },
  { line: 2, code: '  idx = hash(key) // Compute base bucket index', explanation: 'Maps key to initial slot using division, multiplication, or polynomial hash' },
  { line: 3, code: '  // CHAINING: Search or insert in bucket linked list', explanation: 'Separate Chaining: items colliding at idx form a bucket list' },
  { line: 4, code: '  // OPEN ADDRESSING: i = 0; while slot occupied:', explanation: 'Probe sequence: slot = (idx + i) % m or (idx + i²) % m' },
  { line: 5, code: '  // Search continues PAST tombstones until empty slot', explanation: 'Tombstones (DEL) preserve probe chain continuity' },
  { line: 6, code: '  // Insert reuses tombstone ONLY after confirming key absent', explanation: 'Prevents duplicate keys from being created' },
  { line: 7, code: '  if loadFactor > threshold: rehash(2 * capacity)', explanation: 'Dynamic table resizing and key redistribution' },
];

const hashComplexity: ComplexityMetric = {
  best: 'O(1)',
  average: 'O(1)',
  worst: 'O(N)',
  plainEnglish: 'Constant O(1) expected time for insert, search, and delete when load factor is kept below threshold. Degrades to O(N) under heavy clustering.',
  space: 'O(M + N)',
};

export function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

export function getNextPrime(n: number): number {
  let candidate = Math.max(2, Math.floor(n) + 1);
  while (!isPrime(candidate)) {
    candidate++;
  }
  return candidate;
}

export function generateHashSteps(input: HashOperationInput): Step<HashSnapshot, Record<string, unknown>>[] {
  const {
    capacity: initialCapacity,
    collisionStrategy,
    hashFunction,
    initialEntries = [],
    initialTable,
    initialChains,
    operation,
  } = input;

  const steps: Step<HashSnapshot, Record<string, unknown>>[] = [];

  let capacity = Math.max(3, initialCapacity);
  let comparisons = 0;
  let iterations = 0;
  let accesses = 0;
  let operations = 0;

  // Initialize storage structures
  let table: TableSlot[] = new Array(capacity).fill(null);
  let chains: HashEntry[][] = Array.from({ length: capacity }, () => []);
  let count = 0;
  let tombstoneCount = 0;
  let opIsDuplicateRejected = false;
  let opIsTableFull = false;
  let opIsProbeFailed = false;
  let opFirstTombstoneIndex: number | null = null;

  if (initialTable && initialTable.length === capacity) {
    table = initialTable.map((slot) => (slot ? { ...slot } : null));
    count = table.filter((slot) => slot !== null && !slot.isTombstone).length;
    tombstoneCount = table.filter((slot) => slot !== null && slot.isTombstone).length;
  } else if (initialChains && initialChains.length === capacity) {
    chains = initialChains.map((bucket) => bucket.map((e) => ({ ...e })));
    count = chains.reduce((acc, bucket) => acc + bucket.length, 0);
  } else {
    // Pre-populate initial entries silently
    for (const entry of initialEntries) {
      const { hash } = computeHash(entry.key, capacity, hashFunction);
      if (collisionStrategy === 'chaining') {
        if (!chains[hash].some((e) => e.key === entry.key)) {
          chains[hash].push({ key: entry.key, val: entry.val });
          count++;
        }
      } else {
        let inserted = false;
        for (let i = 0; i < capacity; i++) {
          const slot =
            collisionStrategy === 'linear-probing'
              ? (hash + i) % capacity
              : (hash + i * i) % capacity;

          if (table[slot] && table[slot]!.key === entry.key && !table[slot]!.isTombstone) {
            break; // Avoid duplicates
          }
          if (!table[slot] || table[slot]!.isTombstone) {
            table[slot] = { key: entry.key, val: entry.val };
            count++;
            inserted = true;
            break;
          }
        }
        if (!inserted) break;
      }
    }
  }

  function getLoadFactor(): number {
    return Number((count / capacity).toFixed(2));
  }

  function createSnapshot(
    desc: string,
    detail: string,
    codeLine: number,
    type: Step['type'] = 'visit',
    activeSlot: number | null = null,
    probeSeq: number[] = [],
    foundSlot: number | null = null,
    firstTombstone: number | null = null,
    extras: {
      isTableFull?: boolean;
      isProbeFailed?: boolean;
      isDuplicateRejected?: boolean;
      resizeRecommended?: boolean;
      rehashProgress?: { fromCapacity: number; toCapacity: number; currentKey?: string | number };
    } = {}
  ): Step<HashSnapshot, Record<string, unknown>> {
    const alpha = getLoadFactor();
    const threshold = collisionStrategy === 'chaining' ? 0.75 : 0.5;

    return {
      id: steps.length,
      type,
      description: desc,
      explanationDetail: detail,
      codeLine,
      highlightedIndices: activeSlot !== null ? [activeSlot] : [],
      state: {
        capacity,
        count,
        tombstoneCount,
        loadFactor: alpha,
        collisionStrategy,
        hashFunction,
        table: table.map((slot) => (slot ? { ...slot } : null)),
        chains: chains.map((b) => b.map((e) => ({ ...e }))),
        operationType: operation.type,
        currentKey: operation.key,
        activeSlotIndex: activeSlot,
        probeSequence: [...probeSeq],
        foundSlotIndex: foundSlot,
        firstTombstoneIndex: firstTombstone !== null ? firstTombstone : opFirstTombstoneIndex,
        isTableFull: extras.isTableFull ?? opIsTableFull,
        isProbeFailed: extras.isProbeFailed ?? opIsProbeFailed,
        isDuplicateRejected: extras.isDuplicateRejected ?? opIsDuplicateRejected,
        resizeRecommended: extras.resizeRecommended ?? (alpha >= threshold),
        rehashProgress: extras.rehashProgress,
      },
      auxiliaryState: {},
      counters: {
        comparisons,
        swaps: operations,
        iterations,
        accesses,
      },
    };
  }

  // Initial step
  const { hash: baseHash, explanation: hashCalcExp } = computeHash(
    operation.key,
    capacity,
    hashFunction
  );

  steps.push(
    createSnapshot(
      `Starting ${operation.type.toUpperCase()} operation for key "${operation.key}".`,
      `${hashCalcExp}. Target base index is slot ${baseHash}. Collision strategy: ${collisionStrategy}.`,
      2,
      'start',
      baseHash
    )
  );

  // EXECUTE OPERATION
  if (collisionStrategy === 'chaining') {
    // SEPARATE CHAINING
    const bucket = chains[baseHash];
    iterations++;
    accesses++;

    if (operation.type === 'insert') {
      // Check for duplicate key in bucket
      let duplicateIndex = -1;
      for (let i = 0; i < bucket.length; i++) {
        comparisons++;
        accesses++;
        if (bucket[i].key === operation.key) {
          duplicateIndex = i;
          break;
        }
      }

      if (duplicateIndex !== -1) {
        opIsDuplicateRejected = true;
        steps.push(
          createSnapshot(
            `Duplicate key ("${operation.key}") detected in bucket ${baseHash}! Insertion rejected.`,
            `Key "${operation.key}" already exists at position ${duplicateIndex} in bucket ${baseHash}. Hash table enforces strictly unique keys.`,
            3,
            'compare',
            baseHash,
            [],
            null,
            null,
            { isDuplicateRejected: true }
          )
        );
      } else {
        operations++;
        count++;
        bucket.push({ key: operation.key, val: operation.val ?? operation.key });

        steps.push(
          createSnapshot(
            `Inserted key ("${operation.key}") into bucket ${baseHash}. Bucket size is now ${bucket.length}.`,
            `No collision conflict: entry appended to bucket list at index ${baseHash}. Current load factor α = ${getLoadFactor()}.`,
            3,
            'insert',
            baseHash
          )
        );
      }
    } else if (operation.type === 'search') {
      let found = false;
      for (let i = 0; i < bucket.length; i++) {
        comparisons++;
        accesses++;
        if (bucket[i].key === operation.key) {
          found = true;
          steps.push(
            createSnapshot(
              `Found key ("${operation.key}") in bucket ${baseHash} at index position ${i}!`,
              `Search succeeded after examining ${i + 1} bucket element(s). Value is "${bucket[i].val}".`,
              3,
              'found',
              baseHash,
              [],
              baseHash
            )
          );
          break;
        }
      }

      if (!found) {
        steps.push(
          createSnapshot(
            `Key ("${operation.key}") not found in bucket ${baseHash}.`,
            `Exhausted all ${bucket.length} item(s) in bucket ${baseHash}. Key does not exist in table.`,
            3,
            'not-found',
            baseHash
          )
        );
      }
    } else if (operation.type === 'delete') {
      const idx = bucket.findIndex((e) => e.key === operation.key);
      comparisons += Math.max(1, idx !== -1 ? idx + 1 : bucket.length);

      if (idx !== -1) {
        operations++;
        count--;
        bucket.splice(idx, 1);

        steps.push(
          createSnapshot(
            `Deleted key ("${operation.key}") from bucket ${baseHash}.`,
            `Unlinked entry from bucket chain. Bucket ${baseHash} now contains ${bucket.length} item(s).`,
            3,
            'delete',
            baseHash
          )
        );
      } else {
        steps.push(
          createSnapshot(
            `Cannot delete: key ("${operation.key}") does not exist in bucket ${baseHash}.`,
            `Bucket ${baseHash} does not contain key "${operation.key}".`,
            3,
            'not-found',
            baseHash
          )
        );
      }
    }
  } else {
    // OPEN ADDRESSING: LINEAR PROBING OR QUADRATIC PROBING
    const probeSeq: number[] = [];
    let firstTombstone: number | null = null;
    let foundSlot: number | null = null;
    let duplicateFoundSlot: number | null = null;
    let vacantSlot: number | null = null;

    // Explore probe sequence
    for (let i = 0; i < capacity; i++) {
      iterations++;
      accesses++;

      const slot =
        collisionStrategy === 'linear-probing'
          ? (baseHash + i) % capacity
          : (baseHash + i * i) % capacity;

      probeSeq.push(slot);
      const currentEntry = table[slot];

      if (currentEntry === null) {
        // Reached an empty slot
        vacantSlot = slot;
        steps.push(
          createSnapshot(
            `Probe #${i} inspected slot ${slot}: EMPTY.`,
            `Reached vacant slot at index ${slot}. Any search terminates here because the key would have been inserted here or earlier.`,
            4,
            'visit',
            slot,
            probeSeq
          )
        );
        break;
      } else if (currentEntry.isTombstone) {
        // Reached a tombstone
        if (firstTombstone === null) {
          firstTombstone = slot;
          opFirstTombstoneIndex = slot;
        }

        steps.push(
          createSnapshot(
            `Probe #${i} inspected slot ${slot}: TOMBSTONE (DEL). Continuing probe...`,
            `Slot ${slot} was previously deleted. Search MUST continue past tombstones to maintain probe chain integrity.`,
            5,
            'visit',
            slot,
            probeSeq,
            null,
            firstTombstone
          )
        );
      } else {
        // Occupied active slot
        comparisons++;
        if (currentEntry.key === operation.key) {
          duplicateFoundSlot = slot;
          foundSlot = slot;
          steps.push(
            createSnapshot(
              `Probe #${i} inspected slot ${slot}: MATCH FOUND for key ("${operation.key}").`,
              `Key "${operation.key}" located at slot ${slot} with value "${currentEntry.val}".`,
              operation.type === 'search' ? 5 : 6,
              'found',
              slot,
              probeSeq,
              slot
            )
          );
          break;
        } else {
          steps.push(
            createSnapshot(
              `Probe #${i} inspected slot ${slot}: Occupied by key ("${currentEntry.key}"). Collision!`,
              `Slot ${slot} contains "${currentEntry.key}" ≠ "${operation.key}". Probing next position.`,
              4,
              'compare',
              slot,
              probeSeq
            )
          );
        }
      }
    }

    // Now execute operation based on probe result
    if (operation.type === 'insert') {
      if (duplicateFoundSlot !== null) {
        opIsDuplicateRejected = true;
        steps.push(
          createSnapshot(
            `Duplicate key ("${operation.key}") rejected! Key already present at slot ${duplicateFoundSlot}.`,
            `Unique keys policy: duplicate insertion blocked. Key "${operation.key}" retains its original entry at slot ${duplicateFoundSlot}.`,
            6,
            'not-found',
            duplicateFoundSlot,
            probeSeq,
            null,
            null,
            { isDuplicateRejected: true }
          )
        );
      } else if (firstTombstone !== null) {
        // Reuse tombstone slot safely (confirmed key does not exist)
        operations++;
        count++;
        tombstoneCount--;
        table[firstTombstone] = { key: operation.key, val: operation.val ?? operation.key };

        steps.push(
          createSnapshot(
            `Reused tombstone slot ${firstTombstone} for key ("${operation.key}").`,
            `After confirming key "${operation.key}" is absent from the probe sequence, tombstone slot ${firstTombstone} was safely reclaimed.`,
            6,
            'insert',
            firstTombstone,
            probeSeq,
            firstTombstone
          )
        );
      } else if (vacantSlot !== null) {
        // Insert into first vacant slot
        operations++;
        count++;
        table[vacantSlot] = { key: operation.key, val: operation.val ?? operation.key };

        steps.push(
          createSnapshot(
            `Inserted key ("${operation.key}") into vacant slot ${vacantSlot}.`,
            `Probe sequence succeeded after ${probeSeq.length} probe(s). Current load factor α = ${getLoadFactor()}.`,
            6,
            'insert',
            vacantSlot,
            probeSeq,
            vacantSlot
          )
        );
      } else {
        // Table Full or Quadratic Probing Cycle Failure!
        if (collisionStrategy === 'quadratic-probing') {
          opIsProbeFailed = true;
          steps.push(
            createSnapshot(
              `Quadratic Probing Failure: Unable to locate a vacant slot after exploring ${capacity} probes.`,
              `Due to quadratic residue cycles (h + i² mod m), quadratic probing can miss free slots when table capacity m is not prime or load factor exceeds 0.5. Resize/rehash is required.`,
              7,
              'not-found',
              null,
              probeSeq,
              null,
              null,
              { isProbeFailed: true, resizeRecommended: true }
            )
          );
        } else {
          opIsTableFull = true;
          steps.push(
            createSnapshot(
              `Table Full: All ${capacity} slots in the table are occupied or tombstones. Cannot insert!`,
              `Linear probing reached maximum capacity saturation. Table must be resized to accept new entries.`,
              7,
              'not-found',
              null,
              probeSeq,
              null,
              null,
              { isTableFull: true, resizeRecommended: true }
            )
          );
        }
      }
    } else if (operation.type === 'search') {
      if (foundSlot === null) {
        steps.push(
          createSnapshot(
            `Search finished: key ("${operation.key}") is NOT present in the table.`,
            `Explored probe sequence [${probeSeq.join(' → ')}]. Stopped at empty slot or maximum probes.`,
            5,
            'not-found',
            null,
            probeSeq
          )
        );
      }
    } else if (operation.type === 'delete') {
      if (foundSlot !== null) {
        operations++;
        count--;
        tombstoneCount++;
        table[foundSlot] = { key: 'DEL', val: 'DEL', isTombstone: true };

        steps.push(
          createSnapshot(
            `Deleted key ("${operation.key}") from slot ${foundSlot}. Marked as TOMBSTONE (DEL).`,
            `Tombstone placed at slot ${foundSlot}. Subsequent searches for other keys that collided past slot ${foundSlot} will continue unbroken.`,
            5,
            'delete',
            foundSlot,
            probeSeq
          )
        );
      } else {
        steps.push(
          createSnapshot(
            `Cannot delete: key ("${operation.key}") does not exist in table.`,
            `Probe search concluded without finding key "${operation.key}".`,
            5,
            'not-found',
            null,
            probeSeq
          )
        );
      }
    }
  }

  // Handle REHASH / RESIZE Operation
  if (operation.type === 'rehash') {
    const oldCapacity = capacity;
    const newCapacity =
      collisionStrategy === 'quadratic-probing'
        ? getNextPrime(oldCapacity * 2)
        : (operation.newCapacity ?? oldCapacity * 2);
    const oldEntries: HashEntry[] = [];

    if (collisionStrategy === 'chaining') {
      for (const b of chains) {
        for (const e of b) oldEntries.push({ ...e });
      }
    } else {
      for (const s of table) {
        if (s && !s.isTombstone) oldEntries.push({ ...s });
      }
    }

    // Reset table to new capacity
    capacity = newCapacity;
    table = new Array(newCapacity).fill(null);
    chains = Array.from({ length: newCapacity }, () => []);
    count = 0;
    tombstoneCount = 0;

    steps.push(
      createSnapshot(
        `Initiating table rehash: resizing capacity from ${oldCapacity} → ${newCapacity}.`,
        collisionStrategy === 'quadratic-probing'
          ? `Quadratic Probing resizing: table capacity expanded to the next prime above 2m (${newCapacity} > ${oldCapacity * 2}) to guarantee probe cycle safety and eliminate residue cycles. Redistributing ${oldEntries.length} active key(s).`
          : `Initiating table rehash: resizing capacity from ${oldCapacity} → ${newCapacity} (2 × ${oldCapacity}) and zeroing tombstones. Redistributing all ${oldEntries.length} active keys using new modulo ${newCapacity}.`,
        7,
        'start',
        null,
        [],
        null,
        null,
        { rehashProgress: { fromCapacity: oldCapacity, toCapacity: newCapacity } }
      )
    );

    // Re-insert each active entry
    for (const entry of oldEntries) {
      const { hash: newHash, explanation: exp } = computeHash(entry.key, capacity, hashFunction);
      operations++;
      count++;

      if (collisionStrategy === 'chaining') {
        chains[newHash].push(entry);
        steps.push(
          createSnapshot(
            `Rehashed key ("${entry.key}") into new bucket ${newHash}.`,
            `${exp}. Inserted into resized bucket list.`,
            7,
            'insert',
            newHash,
            [],
            newHash,
            null,
            { rehashProgress: { fromCapacity: oldCapacity, toCapacity: newCapacity, currentKey: entry.key } }
          )
        );
      } else {
        for (let i = 0; i < capacity; i++) {
          const slot =
            collisionStrategy === 'linear-probing'
              ? (newHash + i) % capacity
              : (newHash + i * i) % capacity;

          if (!table[slot]) {
            table[slot] = entry;
            steps.push(
              createSnapshot(
                `Rehashed key ("${entry.key}") into new slot ${slot}.`,
                `${exp}. Positioned at slot ${slot} in expanded table.`,
                7,
                'insert',
                slot,
                [slot],
                slot,
                null,
                { rehashProgress: { fromCapacity: oldCapacity, toCapacity: newCapacity, currentKey: entry.key } }
              )
            );
            break;
          }
        }
      }
    }
  }

  // Completion step
  const finalLoad = getLoadFactor();
  const threshold = collisionStrategy === 'chaining' ? 0.75 : 0.5;
  const isHighLoad = finalLoad >= threshold;

  steps.push(
    createSnapshot(
      `Hash table operation complete! Active keys: ${count}, Capacity: ${capacity}, Load Factor α = ${finalLoad}.`,
      isHighLoad
        ? `Warning: Load factor α = ${finalLoad} exceeds threshold (${threshold}). Resizing table is recommended to prevent collision degradation.`
        : `Table health optimal: load factor α = ${finalLoad} is within safe operational limits.`,
      1,
      'complete',
      null,
      [],
      null,
      null,
      { resizeRecommended: isHighLoad || opIsTableFull || opIsProbeFailed }
    )
  );

  return steps;
}

export const hashTableAlgorithm: AlgorithmDefinition<HashOperationInput, HashSnapshot, Record<string, unknown>> = {
  id: 'hashing',
  name: 'Hash Table (Collision Resolution)',
  category: 'hashing',
  description: 'Interactive hash table demonstrating Division, Multiplication, and String Polynomial hashing with Chaining, Linear Probing, Quadratic Probing, Tombstones, and Dynamic Resizing.',
  realWorldAnalogy: 'A library card catalog or coat-check room: items are mapped directly to numbered cubbies by a ticket number.',
  complexity: hashComplexity,
  pseudocode: hashPseudocode,
  generateSteps: generateHashSteps,
  defaultInput: {
    capacity: 7,
    collisionStrategy: 'linear-probing',
    hashFunction: 'division',
    initialEntries: [
      { key: 10, val: 10 },
      { key: 17, val: 17 },
      { key: 24, val: 24 },
    ],
    operation: {
      type: 'insert',
      key: 31,
      val: 31,
    },
  },
  sampleInputs: [
    {
      label: 'Linear Probing Collision & Tombstones',
      input: {
        capacity: 7,
        collisionStrategy: 'linear-probing',
        hashFunction: 'division',
        initialEntries: [
          { key: 10, val: 10 },
          { key: 17, val: 17 },
          { key: 24, val: 24 },
        ],
        operation: { type: 'delete', key: 17 },
      },
    },
    {
      label: 'Quadratic Probing Probe Failure Demo',
      input: {
        capacity: 6, // non-prime table size with residue cycle 0, 1, 4, 3, 4, 1
        collisionStrategy: 'quadratic-probing',
        hashFunction: 'division',
        initialEntries: [
          { key: 6, val: 6 },
          { key: 12, val: 12 },
          { key: 18, val: 18 },
          { key: 24, val: 24 },
        ],
        operation: { type: 'insert', key: 30 },
      },
    },
    {
      label: 'Separate Chaining with Strings',
      input: {
        capacity: 5,
        collisionStrategy: 'chaining',
        hashFunction: 'string-poly',
        initialEntries: [
          { key: 'apple', val: 1 },
          { key: 'banana', val: 2 },
          { key: 'apricot', val: 3 },
        ],
        operation: { type: 'search', key: 'apple' },
      },
    },
    {
      label: 'Multiplication Hash Method',
      input: {
        capacity: 8,
        collisionStrategy: 'linear-probing',
        hashFunction: 'multiplication',
        initialEntries: [
          { key: 15, val: 15 },
          { key: 22, val: 22 },
        ],
        operation: { type: 'insert', key: 37 },
      },
    },
  ],
};
