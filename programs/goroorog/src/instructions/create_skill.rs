use anchor_lang::prelude::*;

use crate::constants::*;
use crate::states::*;

pub fn create_skill(ctx: Context<CreateSkill>, id: u8, data: [u64; 2]) -> Result<()> {
    let skill = &mut ctx.accounts.skill;

    skill.skill_id = id;
    skill.authority = ctx.accounts.owner.key();
    skill.base = data[0];
    skill.level = data[1];
    skill.bump = ctx.bumps.skill;

    Ok(())
}

#[derive(Accounts)]
#[instruction(id: u8)]
pub struct CreateSkill<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: This is the owner of the skill
    #[account(mut)]
    pub owner: AccountInfo<'info>,

    #[account(init, seeds = [SKILLS_SEED, id.to_le_bytes().as_ref(), owner.key().as_ref()], bump, payer = payer, space = 8 + Skills::INIT_SPACE)]
    pub skill: Account<'info, Skills>,

    pub system_program: Program<'info, System>,
}
