use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Skills {
    pub authority: Pubkey,
    pub skill_id: u8,
    pub base: u64,
    pub level: u64,
    pub bump: u8,
}
