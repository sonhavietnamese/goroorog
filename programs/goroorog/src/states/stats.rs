use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Stats {
    pub authority: Pubkey,
    pub stat_id: u8,
    pub base: u64,
    pub level: u64,
    pub bump: u8,
}
