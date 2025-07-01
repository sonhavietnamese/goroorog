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

#[error_code]
pub enum ResourceError {
    #[msg("Not owner")]
    NotOwner,
}

#[error_code]
pub enum HistoryError {
    #[msg("Not owner")]
    NotOwner,
}
