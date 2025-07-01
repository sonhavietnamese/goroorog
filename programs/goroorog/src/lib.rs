use anchor_lang::prelude::*;

mod constants;
mod errors;
mod instructions;
mod states;

use instructions::*;

declare_id!("7FyBUa4ZCA2krXYmSkJW6jdfZGVUpF6wTbYNUE5jRFyq");

#[program]
pub mod goroorog {
    use super::*;

    pub fn create_boss(ctx: Context<CreateBoss>, id: u8) -> Result<()> {
        instructions::create_boss(ctx, id)
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

    pub fn create_resource(ctx: Context<CreateResource>, id: u8, data: [u64; 1]) -> Result<()> {
        instructions::create_resource(ctx, id, data)
    }

    pub fn update_stat(ctx: Context<UpdateStat>, data: [u64; 2]) -> Result<()> {
        instructions::update_stat(ctx, data)
    }

    pub fn update_resource(ctx: Context<UpdateResource>, data: [u64; 1]) -> Result<()> {
        instructions::update_resource(ctx, data)
    }

    pub fn update_history(ctx: Context<UpdateHistory>, data: [u64; 1]) -> Result<()> {
        instructions::update_history(ctx, data)
    }
}
