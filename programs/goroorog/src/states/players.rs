use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Players {
    pub authority: Pubkey,
    pub max_health: u64,
    pub current_health: u64,

    pub bump: u8,
}
