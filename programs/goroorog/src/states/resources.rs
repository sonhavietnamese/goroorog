use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Resources {
    pub authority: Pubkey,
    pub resource_id: u8,
    pub amount: u64,
    pub bump: u8,
}
