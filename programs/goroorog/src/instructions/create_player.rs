use anchor_lang::prelude::*;

use crate::constants::PLAYERS_SEED;
use crate::states::Players;

pub fn create_player(ctx: Context<CreatePlayer>, data: [u64; 500]) -> Result<()> {
    let player = &mut ctx.accounts.player;

    player.authority = ctx.accounts.payer.key();
    player.max_health = data[0];
    player.current_health = data[0];

    player.bump = ctx.bumps.player;

    Ok(())
}

#[derive(Accounts)]
pub struct CreatePlayer<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(init, payer = payer, seeds = [PLAYERS_SEED, payer.key().as_ref()], bump, space = 8 + Players::INIT_SPACE)]
    pub player: Account<'info, Players>,
    pub system_program: Program<'info, System>,
}
