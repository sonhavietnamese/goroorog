use anchor_lang::prelude::*;

use crate::states::*;

pub fn create_boss(ctx: Context<CreateBoss>) -> Result<()> {
    let boss = &mut ctx.accounts.boss;

    boss.level = 1;

    Ok(())
}

#[derive(Accounts)]
pub struct CreateBoss<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(init, payer = payer, space = 8 + Bosses::INIT_SPACE)]
    pub boss: Account<'info, Bosses>,

    pub system_program: Program<'info, System>,
}
