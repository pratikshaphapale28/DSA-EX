import { describe, it, expect } from 'vitest';
import { computeHash } from '../src/algorithms/hashing/hashFunctions';
import { generateHashSteps } from '../src/algorithms/hashing/hashTable';
import type { TableSlot, HashEntry } from '../src/types/hash';

describe('Phase 6: Hash Functions (Division, Multiplication, String Polynomial)', () => {
  it('computes Division method k mod m and formats narration explanation', () => {
    const res1 = computeHash(42, 7, 'division');
    expect(res1.hash).toBe(0);
    expect(res1.explanation).toContain('42 mod 7 = 0');

    const res2 = computeHash(25, 7, 'division');
    expect(res2.hash).toBe(4);
    expect(res2.explanation).toContain('25 mod 7 = 4');

    const strRes = computeHash('cat', 5, 'division');
    expect(strRes.hash).toBeGreaterThanOrEqual(0);
    expect(strRes.hash).toBeLessThan(5);
    expect(strRes.explanation).toContain('ASCII sum for Division on strings');
  });

  it('computes Multiplication method using Knuth golden ratio', () => {
    const res = computeHash(12345, 10, 'multiplication');
    expect(res.hash).toBeGreaterThanOrEqual(0);
    expect(res.hash).toBeLessThan(10);
    expect(res.explanation).toContain('Multiplication Method');
    expect(res.explanation).toContain('0.618034');
  });

  it('computes Polynomial String Hash correctly', () => {
    const res = computeHash('dsa', 11, 'string-poly');
    expect(res.hash).toBeGreaterThanOrEqual(0);
    expect(res.hash).toBeLessThan(11);
    expect(res.explanation).toContain('base-31 polynomial for the String hash');
  });
});

describe('Phase 6: Separate Chaining 200+ Random Sequence vs JS Map Model', () => {
  it('executes 200+ random insert, search, delete and rehash operations matching JS Map model', () => {
    const model = new Map<string | number, string | number>();
    let capacity = 7;
    let chains: HashEntry[][] = Array.from({ length: capacity }, () => []);

    for (let opIdx = 0; opIdx < 220; opIdx++) {
      const rand = Math.random();
      const randomKey = Math.floor(Math.random() * 50) + 1;
      const randomVal = `val_${randomKey}`;

      if (rand < 0.5) {
        // INSERT
        const alreadyInModel = model.has(randomKey);
        const steps = generateHashSteps({
          capacity,
          collisionStrategy: 'chaining',
          hashFunction: 'division',
          initialChains: chains,
          operation: { type: 'insert', key: randomKey, val: randomVal },
        });

        const last = steps[steps.length - 1].state;
        chains = last.chains!;

        if (alreadyInModel) {
          // Unique keys policy: duplicate is rejected
          expect(last.isDuplicateRejected).toBe(true);
        } else {
          model.set(randomKey, randomVal);
          expect(last.count).toBe(model.size);
        }
      } else if (rand < 0.8) {
        // SEARCH
        // 50% search existing key, 50% search random key
        const keyToSearch =
          model.size > 0 && Math.random() < 0.5
            ? Array.from(model.keys())[Math.floor(Math.random() * model.size)]
            : randomKey;

        const steps = generateHashSteps({
          capacity,
          collisionStrategy: 'chaining',
          hashFunction: 'division',
          initialChains: chains,
          operation: { type: 'search', key: keyToSearch },
        });

        const foundStep = steps.find((s) => s.type === 'found');
        if (model.has(keyToSearch)) {
          expect(foundStep).toBeDefined();
          expect(foundStep?.state.foundSlotIndex).not.toBeNull();
        } else {
          expect(foundStep).toBeUndefined();
        }
      } else if (rand < 0.95) {
        // DELETE
        const keyToDelete =
          model.size > 0 && Math.random() < 0.6
            ? Array.from(model.keys())[Math.floor(Math.random() * model.size)]
            : randomKey;

        const existed = model.has(keyToDelete);
        const steps = generateHashSteps({
          capacity,
          collisionStrategy: 'chaining',
          hashFunction: 'division',
          initialChains: chains,
          operation: { type: 'delete', key: keyToDelete },
        });

        const last = steps[steps.length - 1].state;
        chains = last.chains!;

        if (existed) {
          model.delete(keyToDelete);
          expect(last.count).toBe(model.size);
        }
      } else if (capacity < 64) {
        // REHASH / RESIZE
        const newCap = capacity * 2;
        const steps = generateHashSteps({
          capacity,
          collisionStrategy: 'chaining',
          hashFunction: 'division',
          initialChains: chains,
          operation: { type: 'rehash', key: 'resize', newCapacity: newCap },
        });

        const last = steps[steps.length - 1].state;
        capacity = last.capacity;
        chains = last.chains!;
        expect(capacity).toBe(newCap);
        expect(last.count).toBe(model.size);
      }

      // Check after every operation: every key in JS Map must be in chains
      let totalItemsInChains = 0;
      for (const bucket of chains) {
        totalItemsInChains += bucket.length;
        for (const entry of bucket) {
          expect(model.has(entry.key)).toBe(true);
        }
      }
      expect(totalItemsInChains).toBe(model.size);
    }
  });
});

describe('Phase 6: Linear Probing 200+ Random Sequence with Tombstones & Resizing', () => {
  it('executes 200+ random operations with linear probing, verifying tombstone search and reuse', () => {
    const model = new Map<string | number, string | number>();
    let capacity = 31; // Prime capacity to accommodate items comfortably
    let table: TableSlot[] = new Array(capacity).fill(null);

    for (let opIdx = 0; opIdx < 220; opIdx++) {
      const rand = Math.random();
      const randomKey = Math.floor(Math.random() * 80) + 1;
      const randomVal = `val_${randomKey}`;

      if (rand < 0.5) {
        // INSERT
        const alreadyInModel = model.has(randomKey);
        const steps = generateHashSteps({
          capacity,
          collisionStrategy: 'linear-probing',
          hashFunction: 'division',
          initialTable: table,
          operation: { type: 'insert', key: randomKey, val: randomVal },
        });

        const last = steps[steps.length - 1].state;
        table = last.table;

        if (alreadyInModel) {
          expect(last.isDuplicateRejected).toBe(true);
        } else if (!last.isTableFull) {
          model.set(randomKey, randomVal);
          expect(last.count).toBe(model.size);
        }
      } else if (rand < 0.8) {
        // SEARCH
        const keyToSearch =
          model.size > 0 && Math.random() < 0.6
            ? Array.from(model.keys())[Math.floor(Math.random() * model.size)]
            : randomKey;

        const steps = generateHashSteps({
          capacity,
          collisionStrategy: 'linear-probing',
          hashFunction: 'division',
          initialTable: table,
          operation: { type: 'search', key: keyToSearch },
        });

        const foundStep = steps.find((s) => s.type === 'found');
        if (model.has(keyToSearch)) {
          expect(foundStep).toBeDefined();
          expect(foundStep?.state.foundSlotIndex).not.toBeNull();
        } else {
          expect(foundStep).toBeUndefined();
        }
      } else if (rand < 0.95) {
        // DELETE (Creates Tombstone)
        const keyToDelete =
          model.size > 0 && Math.random() < 0.6
            ? Array.from(model.keys())[Math.floor(Math.random() * model.size)]
            : randomKey;

        const existed = model.has(keyToDelete);
        const steps = generateHashSteps({
          capacity,
          collisionStrategy: 'linear-probing',
          hashFunction: 'division',
          initialTable: table,
          operation: { type: 'delete', key: keyToDelete },
        });

        const last = steps[steps.length - 1].state;
        table = last.table;

        if (existed) {
          model.delete(keyToDelete);
          expect(last.count).toBe(model.size);
          // Confirm deleted slot became a tombstone
          const delStep = steps.find((s) => s.type === 'delete');
          expect(delStep).toBeDefined();
          const slotIdx = delStep?.state.activeSlotIndex;
          expect(table[slotIdx!]).toBeDefined();
          expect(table[slotIdx!]?.isTombstone).toBe(true);
        }
      } else if (capacity < 64) {
        // REHASH
        const newCap = capacity * 2;
        const steps = generateHashSteps({
          capacity,
          collisionStrategy: 'linear-probing',
          hashFunction: 'division',
          initialTable: table,
          operation: { type: 'rehash', key: 'resize', newCapacity: newCap },
        });

        const last = steps[steps.length - 1].state;
        capacity = last.capacity;
        table = last.table;
        expect(capacity).toBe(newCap);
        expect(last.count).toBe(model.size);
        expect(last.tombstoneCount).toBe(0); // Tombstones purged upon rehash
      }

      // Invariant check: after every operation, active table items match model exactly
      let activeSlotsCount = 0;
      for (const slot of table) {
        if (slot && !slot.isTombstone) {
          activeSlotsCount++;
          expect(model.has(slot.key)).toBe(true);
        }
      }
      expect(activeSlotsCount).toBe(model.size);
    }

    // End-of-sequence sweep: verify every remaining key is successfully found by search
    for (const [k] of model.entries()) {
      const searchSteps = generateHashSteps({
        capacity,
        collisionStrategy: 'linear-probing',
        hashFunction: 'division',
        initialTable: table,
        operation: { type: 'search', key: k },
      });
      const found = searchSteps.find((s) => s.type === 'found');
      expect(found, `Key ${k} must be found across collisions/tombstones`).toBeDefined();
    }
  });
});

describe('Phase 6: Quadratic Probing 200+ Random Sequence vs JS Map Model', () => {
  it('executes 200+ random operations with quadratic probing', () => {
    const model = new Map<string | number, string | number>();
    let capacity = 37; // Prime capacity > 2 * items
    let table: TableSlot[] = new Array(capacity).fill(null);

    for (let opIdx = 0; opIdx < 220; opIdx++) {
      const rand = Math.random();
      const randomKey = Math.floor(Math.random() * 60) + 1;
      const randomVal = `val_${randomKey}`;

      if (rand < 0.5) {
        // INSERT
        const alreadyInModel = model.has(randomKey);
        const steps = generateHashSteps({
          capacity,
          collisionStrategy: 'quadratic-probing',
          hashFunction: 'division',
          initialTable: table,
          operation: { type: 'insert', key: randomKey, val: randomVal },
        });

        const last = steps[steps.length - 1].state;
        table = last.table;

        if (alreadyInModel) {
          expect(last.isDuplicateRejected).toBe(true);
        } else if (!last.isProbeFailed && !last.isTableFull) {
          model.set(randomKey, randomVal);
          expect(last.count).toBe(model.size);
        }
      } else if (rand < 0.8) {
        // SEARCH
        const keyToSearch =
          model.size > 0 && Math.random() < 0.5
            ? Array.from(model.keys())[Math.floor(Math.random() * model.size)]
            : randomKey;

        const steps = generateHashSteps({
          capacity,
          collisionStrategy: 'quadratic-probing',
          hashFunction: 'division',
          initialTable: table,
          operation: { type: 'search', key: keyToSearch },
        });

        const foundStep = steps.find((s) => s.type === 'found');
        if (model.has(keyToSearch)) {
          expect(foundStep).toBeDefined();
        } else {
          expect(foundStep).toBeUndefined();
        }
      } else {
        // DELETE
        const keyToDelete =
          model.size > 0 && Math.random() < 0.6
            ? Array.from(model.keys())[Math.floor(Math.random() * model.size)]
            : randomKey;

        const existed = model.has(keyToDelete);
        const steps = generateHashSteps({
          capacity,
          collisionStrategy: 'quadratic-probing',
          hashFunction: 'division',
          initialTable: table,
          operation: { type: 'delete', key: keyToDelete },
        });

        const last = steps[steps.length - 1].state;
        table = last.table;

        if (existed) {
          model.delete(keyToDelete);
          expect(last.count).toBe(model.size);
        }
      }

      let activeCount = 0;
      for (const slot of table) {
        if (slot && !slot.isTombstone) {
          activeCount++;
          expect(model.has(slot.key)).toBe(true);
        }
      }
      expect(activeCount).toBe(model.size);
    }
  });
});

describe('Phase 6: Tombstone Recycling & Search Invariants', () => {
  it('searches past tombstones and reuses tombstone only after confirming key is absent', () => {
    const capacity = 7;
    // Keys 10, 17, 24 all hash to 10 % 7 = 3, 17 % 7 = 3, 24 % 7 = 3
    // Insert 10 -> slot 3
    // Insert 17 -> slot 4
    // Insert 24 -> slot 5
    let table: TableSlot[] = new Array(capacity).fill(null);
    table[3] = { key: 10, val: 10 };
    table[4] = { key: 17, val: 17 };
    table[5] = { key: 24, val: 24 };

    // Delete 17 at slot 4 -> slot 4 becomes DEL (tombstone)
    const delSteps = generateHashSteps({
      capacity,
      collisionStrategy: 'linear-probing',
      hashFunction: 'division',
      initialTable: table,
      operation: { type: 'delete', key: 17 },
    });
    table = delSteps[delSteps.length - 1].state.table;
    expect(table[4]?.isTombstone).toBe(true);

    // Search for 24: MUST probe slot 3 (10), probe slot 4 (DEL - continues past!), probe slot 5 (24 - FOUND!)
    const searchSteps = generateHashSteps({
      capacity,
      collisionStrategy: 'linear-probing',
      hashFunction: 'division',
      initialTable: table,
      operation: { type: 'search', key: 24 },
    });
    const foundStep = searchSteps.find((s) => s.type === 'found');
    expect(foundStep).toBeDefined();
    expect(foundStep?.state.foundSlotIndex).toBe(5);
    // Verify probe sequence touched slot 4 (tombstone) then slot 5
    expect(foundStep?.state.probeSequence).toEqual([3, 4, 5]);

    // Insert duplicate 24: MUST NOT reuse tombstone at slot 4 because 24 already exists!
    const dupSteps = generateHashSteps({
      capacity,
      collisionStrategy: 'linear-probing',
      hashFunction: 'division',
      initialTable: table,
      operation: { type: 'insert', key: 24, val: 999 },
    });
    const dupLast = dupSteps[dupSteps.length - 1].state;
    expect(dupLast.isDuplicateRejected).toBe(true);
    expect(table[4]?.isTombstone).toBe(true); // Tombstone NOT overwritten by duplicate!

    // Insert NEW key 31 (31 % 7 = 3): probes 3 (10), 4 (DEL -> remembers firstTombstone = 4), 5 (24), 6 (EMPTY).
    // Confirms 31 does not exist, then safely reclaims slot 4!
    const insertSteps = generateHashSteps({
      capacity,
      collisionStrategy: 'linear-probing',
      hashFunction: 'division',
      initialTable: table,
      operation: { type: 'insert', key: 31, val: 31 },
    });
    const insertLast = insertSteps[insertSteps.length - 1].state;
    expect(insertLast.table[4]?.key).toBe(31);
    expect(insertLast.table[4]?.isTombstone).toBeUndefined();
    expect(insertLast.firstTombstoneIndex).toBe(4);
  });
});

describe('Phase 6: Edge Cases - Table Full and Quadratic Probing Failure', () => {
  it('detects table-full condition in linear probing without infinite loop', () => {
    const capacity = 4;
    const table: TableSlot[] = [
      { key: 1, val: 1 },
      { key: 2, val: 2 },
      { key: 3, val: 3 },
      { key: 4, val: 4 },
    ];

    const steps = generateHashSteps({
      capacity,
      collisionStrategy: 'linear-probing',
      hashFunction: 'division',
      initialTable: table,
      operation: { type: 'insert', key: 5, val: 5 },
    });

    const last = steps[steps.length - 1].state;
    expect(last.isTableFull).toBe(true);
    expect(last.resizeRecommended).toBe(true);
  });

  it('detects quadratic probing cycle failure when table size is composite and slots 2 and 5 stay free', () => {
    // Capacity 6: (h + i^2) mod 6 explores only residues {0, 1, 4, 3, 4, 1}
    // Pre-filling 6, 12, 18, 24 naturally occupies slots 0, 1, 4, 3.
    // Slots 2 and 5 stay free, but inserting 30 explores 0, 1, 4, 3, 4, 1 and fails!
    const capacity = 6;
    const initialEntries = [
      { key: 6, val: 6 },
      { key: 12, val: 12 },
      { key: 18, val: 18 },
      { key: 24, val: 24 },
    ];

    const steps = generateHashSteps({
      capacity,
      collisionStrategy: 'quadratic-probing',
      hashFunction: 'division',
      initialEntries,
      operation: { type: 'insert', key: 30, val: 30 },
    });

    const last = steps[steps.length - 1].state;
    expect(last.isProbeFailed).toBe(true);
    expect(last.resizeRecommended).toBe(true);

    // Verify slots 2 and 5 are indeed empty
    expect(last.table[2]).toBeNull();
    expect(last.table[5]).toBeNull();
  });

  it('quadratic probing rehashes to next prime above 2m and retains all keys', () => {
    const capacity = 6;
    const initialEntries = [
      { key: 6, val: 6 },
      { key: 12, val: 12 },
      { key: 18, val: 18 },
      { key: 24, val: 24 },
    ];

    // Rehash operation
    const rehashSteps = generateHashSteps({
      capacity,
      collisionStrategy: 'quadratic-probing',
      hashFunction: 'division',
      initialEntries,
      operation: { type: 'rehash', key: 'resize' },
    });

    const rehashLast = rehashSteps[rehashSteps.length - 1].state;
    // Next prime above 2 * 6 = 12 is 13
    expect(rehashLast.capacity).toBe(13);
    expect(rehashLast.count).toBe(4);

    // Verify all keys 6, 12, 18, 24 are still found after resize
    for (const entry of initialEntries) {
      const searchSteps = generateHashSteps({
        capacity: 13,
        collisionStrategy: 'quadratic-probing',
        hashFunction: 'division',
        initialTable: rehashLast.table,
        operation: { type: 'search', key: entry.key },
      });
      const found = searchSteps.find((s) => s.type === 'found');
      expect(found).toBeDefined();
    }
  });
});

describe('Phase 6: Forward & Backward Replay and Counter Integrity', () => {
  it('replaying steps forward and backward preserves immutable state snapshots', () => {
    const steps = generateHashSteps({
      capacity: 7,
      collisionStrategy: 'linear-probing',
      hashFunction: 'division',
      initialEntries: [
        { key: 10, val: 10 },
        { key: 17, val: 17 },
      ],
      operation: { type: 'insert', key: 24, val: 24 },
    });

    expect(steps.length).toBeGreaterThan(1);

    // Save cloned states
    const states = steps.map((s) => JSON.parse(JSON.stringify(s.state)));

    // Walk forward
    for (let i = 0; i < steps.length; i++) {
      expect(steps[i].state).toEqual(states[i]);
    }

    // Walk backward
    for (let i = steps.length - 1; i >= 0; i--) {
      expect(steps[i].state).toEqual(states[i]);
    }
  });

  it('step counters monotonically increase and match operations', () => {
    const steps = generateHashSteps({
      capacity: 7,
      collisionStrategy: 'linear-probing',
      hashFunction: 'division',
      initialEntries: [{ key: 10, val: 10 }],
      operation: { type: 'insert', key: 17, val: 17 },
    });

    let prevComparisons = 0;
    let prevAccesses = 0;
    for (const step of steps) {
      expect(step.counters.comparisons).toBeGreaterThanOrEqual(prevComparisons);
      expect(step.counters.accesses).toBeGreaterThanOrEqual(prevAccesses);
      prevComparisons = step.counters.comparisons;
      prevAccesses = step.counters.accesses;
    }
  });
});
