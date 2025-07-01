use anchor_lang::prelude::*;

use crate::constants::STATS_SEED;
use crate::states::Stats;

pub fn create_stat(ctx: Context<CreateStat>, id: u8, data: [u64; 2]) -> Result<()> {
    let stat = &mut ctx.accounts.stat;

    stat.stat_id = id;
    stat.authority = ctx.accounts.owner.key();
    stat.base = data[0];
    stat.level = data[1];
    stat.bump = ctx.bumps.stat;

    Ok(())
}

#[derive(Accounts)]
#[instruction(id: u8)]
pub struct CreateStat<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: This is the owner of the stat
    #[account(mut)]
    pub owner: AccountInfo<'info>,

    #[account(init, seeds = [STATS_SEED, id.to_le_bytes().as_ref(), owner.key().as_ref(), payer.key().as_ref()], bump, payer = payer, space = 8 + Stats::INIT_SPACE)]
    pub stat: Account<'info, Stats>,

    pub system_program: Program<'info, System>,
}
