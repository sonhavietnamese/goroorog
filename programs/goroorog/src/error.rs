use anchor_lang::prelude::*;

#[error_code]
pub enum BossError {
    #[msg("Invalid attack amount")]
    InvalidAttackAmount,
    #[msg("Boss is already dead")]
    BossAlreadyDead,
}

#[error_code]
pub enum PlayerError {
    #[msg("Player is already dead")]
    PlayerAlreadyDead,
    #[msg("Insufficient resources")]
    InsufficientResources,
}
