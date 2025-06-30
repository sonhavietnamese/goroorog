use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Leaderboard {
    pub authority: Pubkey,
    pub boss: Pubkey,
    pub bump: u8,
    pub damage: u64,
}
