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

    pub fn create_boss(ctx: Context<CreateBoss>) -> Result<()> {
        instructions::create_boss(ctx)
    }

    pub fn create_player(ctx: Context<CreatePlayer>) -> Result<()> {
        instructions::create_player(ctx)
    }

    pub fn create_skill(ctx: Context<CreateSkill>, id: u8, data: [u64; 2]) -> Result<()> {
        instructions::create_skill(ctx, id, data)
    }

    pub fn create_stat(ctx: Context<CreateStat>, id: u8, data: [u64; 2]) -> Result<()> {
        instructions::create_stat(ctx, id, data)
    }

    pub fn create_history(ctx: Context<CreateHistory>, value: u64) -> Result<()> {
        instructions::create_history(ctx, value)
    }
}
