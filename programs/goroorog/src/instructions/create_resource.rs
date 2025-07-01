use anchor_lang::prelude::*;

use crate::constants::RESOURCES_SEED;
use crate::states::Resources;

pub fn create_resource(ctx: Context<CreateResource>, id: u8, data: [u64; 1]) -> Result<()> {
    let resource = &mut ctx.accounts.resource;

    resource.resource_id = id;
    resource.authority = ctx.accounts.owner.key();
    resource.amount = data[0];
    resource.bump = ctx.bumps.resource;

    Ok(())
}

#[derive(Accounts)]
#[instruction(id: u8)]
pub struct CreateResource<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: This is the owner of the skill
    #[account(mut)]
    pub owner: AccountInfo<'info>,

    #[account(init, seeds = [RESOURCES_SEED, id.to_le_bytes().as_ref(), owner.key().as_ref()], bump, payer = payer, space = 8 + Resources::INIT_SPACE)]
    pub resource: Account<'info, Resources>,

    pub system_program: Program<'info, System>,
}
