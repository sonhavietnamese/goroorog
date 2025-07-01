use anchor_lang::prelude::*;

use crate::constants::HISTORY_SEED;
use crate::states::History;

pub fn create_history(ctx: Context<CreateHistory>, value: u64) -> Result<()> {
    let history = &mut ctx.accounts.history;

    history.authority = ctx.accounts.from.key();
    history.from = ctx.accounts.from.key();
    history.to = ctx.accounts.to.key();
    history.value = value;
    history.bump = ctx.bumps.history;

    Ok(())
}

#[derive(Accounts)]
pub struct CreateHistory<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: This is the from account
    #[account(mut)]
    pub from: AccountInfo<'info>,

    /// CHECK: This is the to account
    #[account(mut)]
    pub to: AccountInfo<'info>,

    #[account(init, seeds = [HISTORY_SEED, from.key().as_ref(), to.key().as_ref()], bump, payer = payer, space = 8 + History::INIT_SPACE)]
    pub history: Account<'info, History>,

    pub system_program: Program<'info, System>,
}
