use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Bosses {
    pub level: u64,
}
