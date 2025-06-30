use anchor_lang::prelude::*;

use crate::states::Bosses;

pub fn create_boss(ctx: Context<CreateBoss>, data: [u64; 400]) -> Result<()> {
    let boss = &mut ctx.accounts.boss;
    boss.max_health = data[0];
    boss.current_health = data[0];

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
