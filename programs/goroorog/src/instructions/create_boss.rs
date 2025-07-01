use anchor_lang::prelude::*;

use crate::constants::BOSS_SEED;
use crate::states::*;

pub fn create_boss(ctx: Context<CreateBoss>, id: u8) -> Result<()> {
    let boss = &mut ctx.accounts.boss;

    boss.boss_id = id;
    boss.level = 1;
    boss.bump = ctx.bumps.boss;

    Ok(())
}

#[derive(Accounts)]
#[instruction(id: u8)]
pub struct CreateBoss<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(init, seeds = [BOSS_SEED, id.to_le_bytes().as_ref()], bump, payer = payer, space = 8 + Bosses::INIT_SPACE)]
    pub boss: Account<'info, Bosses>,

    pub system_program: Program<'info, System>,
}
