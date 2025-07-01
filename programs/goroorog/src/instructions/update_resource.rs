use anchor_lang::prelude::*;

use crate::errors::ResourceError;
use crate::states::Resources;

pub fn update_resource(ctx: Context<UpdateResource>, data: [u64; 1]) -> Result<()> {
    let resource = &mut ctx.accounts.resource;

    require!(
        resource.authority == ctx.accounts.owner.key(),
        ResourceError::NotOwner
    );

    resource.amount = resource.amount.checked_add(data[0]).unwrap();

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateResource<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: This is the owner of the stat
    #[account(mut)]
    pub owner: AccountInfo<'info>,

    #[account(mut)]
    pub resource: Account<'info, Resources>,

    pub system_program: Program<'info, System>,
}
