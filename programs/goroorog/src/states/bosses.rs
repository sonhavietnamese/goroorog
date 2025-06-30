use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Bosses {
    pub max_health: u64,
    pub current_health: u64,
}
