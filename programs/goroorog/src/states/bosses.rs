use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Bosses {
    pub boss_id: u8,
    pub level: u64,
    pub bump: u8,
}
