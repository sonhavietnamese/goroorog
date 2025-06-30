use anchor_lang::prelude::*;

mod constants;
mod instructions;
mod states;

use constants::*;
use instructions::*;
use states::*;

declare_id!("7FyBUa4ZCA2krXYmSkJW6jdfZGVUpF6wTbYNUE5jRFyq");

#[program]
pub mod goroorog {
    use super::*;

    pub fn create_boss(ctx: Context<CreateBoss>, data: [u64; 400]) -> Result<()> {
        instructions::create_boss(ctx, data)
    }

    pub fn create_player(ctx: Context<CreatePlayer>, data: [u64; 500]) -> Result<()> {
        instructions::create_player(ctx, data)
    }
}
