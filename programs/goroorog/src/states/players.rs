use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Players {
    pub authority: Pubkey,
    pub bump: u8,
}
