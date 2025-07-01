use anchor_lang::prelude::*;

use crate::constants::PLAYERS_SEED;
use crate::states::Players;

pub fn create_player(ctx: Context<CreatePlayer>) -> Result<()> {
    let player = &mut ctx.accounts.player;
    let owner = &mut ctx.accounts.owner;

    player.authority = owner.key();
    player.bump = ctx.bumps.player;

    Ok(())
}

#[derive(Accounts)]
pub struct CreatePlayer<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: This is the owner of the player
    #[account(mut)]
    pub owner: AccountInfo<'info>,

    #[account(init, payer = payer, seeds = [PLAYERS_SEED, owner.key().as_ref()], bump, space = 8 + Players::INIT_SPACE)]
    pub player: Account<'info, Players>,

    pub system_program: Program<'info, System>,
}
