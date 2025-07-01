use anchor_lang::prelude::*;

use crate::errors::HistoryError;
use crate::states::History;

pub fn update_history(ctx: Context<UpdateHistory>, data: [u64; 1]) -> Result<()> {
    let history = &mut ctx.accounts.history;

    require!(
        history.authority == ctx.accounts.owner.key(),
        HistoryError::NotOwner
    );

    history.value = history.value.checked_add(data[0]).unwrap();

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateHistory<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: This is the owner of the stat
    #[account(mut)]
    pub owner: AccountInfo<'info>,

    #[account(mut)]
    pub history: Account<'info, History>,

    pub system_program: Program<'info, System>,
}
