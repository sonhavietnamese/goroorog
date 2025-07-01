use anchor_lang::prelude::*;

use crate::states::Resources;
use crate::states::Stats;

pub fn update_stat(ctx: Context<UpdateStat>, data: [u64; 2]) -> Result<()> {
    let stat = &mut ctx.accounts.stat;
    let resource = &mut ctx.accounts.resource;

    stat.level = stat.level.checked_add(data[0]).unwrap();
    resource.amount = resource.amount.checked_sub(data[1]).unwrap();

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateStat<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: This is the owner of the stat
    #[account(mut)]
    pub owner: AccountInfo<'info>,

    #[account(mut)]
    pub stat: Account<'info, Stats>,

    #[account(mut)]
    pub resource: Account<'info, Resources>,

    pub system_program: Program<'info, System>,
}
