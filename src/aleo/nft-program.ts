export const NFTProgramId = 'aleo_staking_maxpia_0813.aleo';

export const NFTProgram = `program aleo_staking_maxpia_0813.aleo;

mapping account:
	key left as address.public;
	value right as u32.public;


mapping staked:
	key left as address.public;
	value right as u32.public;


mapping reward:
	key left as address.public;
	value right as u32.public;


mapping last_update_block:
	key left as address.public;
	value right as u32.public;

function mint_public:
    input r0 as u32.public;

    finalize self.caller r0;

finalize mint_public:
    input r0 as address.public;
    input r1 as u32.public;
    get.or_use account[r0] 0u32 into r2;
    add r2 r1 into r3;
    set r3 into account[r0];


function stake:
    input r0 as u32.public;

    finalize self.caller r0;

finalize stake:
    input r0 as address.public;
    input r1 as u32.public;
    get.or_use account[r0] 0u32 into r2;
    gte r2 r1 into r3;
    assert.eq r3 true;
    get.or_use last_update_block[r0] block.height into r4;
    set block.height into last_update_block[r0];
    get.or_use staked[r0] 0u32 into r5;
    sub block.height r4 into r6;
    mul r6 r5 into r7;
    mul r7 1u32 into r8;
    get.or_use reward[r0] 0u32 into r9;
    add r9 r8 into r10;
    set r10 into reward[r0];
    add r5 r1 into r11;
    set r11 into staked[r0];
    sub r2 r1 into r12;
    set r12 into account[r0];


function earn:
    input r0 as u32.public;

    finalize self.caller r0;

finalize earn:
    input r0 as address.public;
    input r1 as u32.public;
    get.or_use reward[r0] 0u32 into r2;
    gte r2 r1 into r3;
    assert.eq r3 true;
    get.or_use last_update_block[r0] block.height into r4;
    set block.height into last_update_block[r0];
    get.or_use staked[r0] 0u32 into r5;
    sub block.height r4 into r6;
    mul r6 r5 into r7;
    mul r7 1u32 into r8;
    get.or_use reward[r0] 0u32 into r9;
    add r9 r8 into r10;
    sub r10 r1 into r11;
    set r11 into reward[r0];
    get.or_use account[r0] 0u32 into r12;
    add r12 r1 into r13;
    set r13 into account[r0];


function withdraw:
    input r0 as u32.public;

    finalize self.caller r0;

finalize withdraw:
    input r0 as address.public;
    input r1 as u32.public;
    get.or_use staked[r0] 0u32 into r2;
    gte r2 r1 into r3;
    assert.eq r3 true;
    get.or_use last_update_block[r0] 0u32 into r4;
    set block.height into last_update_block[r0];
    sub block.height r4 into r5;
    mul r5 r2 into r6;
    mul r6 1u32 into r7;
    get.or_use reward[r0] 0u32 into r8;
    add r8 r7 into r9;
    set r9 into reward[r0];
    sub r2 r1 into r10;
    set r10 into staked[r0];
    get.or_use account[r0] 0u32 into r11;
    add r11 r1 into r12;
    set r12 into account[r0];
`;
