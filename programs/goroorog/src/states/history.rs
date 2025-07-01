use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct History {
    pub authority: Pubkey,
    pub from: Pubkey,
    pub to: Pubkey,
    pub value: u64,
    pub bump: u8,
}
