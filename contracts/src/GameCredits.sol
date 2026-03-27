// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GameCredits
 * @notice Futbolito Monad Blitz — Monad Blitz CDMX 2026
 * @dev Créditos de juego respaldados por on/off-ramp de Etherfuse (MXN ↔ USDC)
 *
 * Flujo:
 *   1. Usuario hace on-ramp MXN → USDC via Etherfuse
 *   2. Backend llama a depositCredits() al confirmar el pago
 *   3. Usuario juega y acumula goles (score)
 *   4. Usuario llama a redeemCredits() para iniciar off-ramp
 */
contract GameCredits {
    address public owner;

    // Créditos por wallet (1 crédito = 1 MXN aprox)
    mapping(address => uint256) public credits;

    // Score total de goles por wallet
    mapping(address => uint256) public totalGoals;

    // Registro de partidas
    struct Game {
        address player;
        uint256 creditsUsed;
        uint256 goals;
        uint256 timestamp;
    }
    Game[] public gameHistory;

    // ─── Eventos ───────────────────────────────────────────────────────
    event CreditsDeposited(address indexed player, uint256 amount, string etherfuseOrderId);
    event CreditsRedeemed(address indexed player, uint256 amount);
    event GoalScored(address indexed player, uint256 totalGoals);
    event GamePlayed(address indexed player, uint256 creditsUsed, uint256 goals);

    // ─── Modificadores ─────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // ─── Depositar créditos (llamado por backend tras confirmar on-ramp) ─
    function depositCredits(address player, uint256 amount, string calldata etherfuseOrderId)
        external onlyOwner
    {
        require(player != address(0), "Wallet invalida");
        require(amount > 0, "Monto debe ser > 0");
        credits[player] += amount;
        emit CreditsDeposited(player, amount, etherfuseOrderId);
    }

    // ─── Registrar gol (llamado desde el frontend via backend) ─────────
    function scoreGoal(address player) external onlyOwner {
        require(credits[player] > 0, "Sin creditos");
        totalGoals[player]++;
        emit GoalScored(player, totalGoals[player]);
    }

    // ─── Registrar partida completa ─────────────────────────────────────
    function recordGame(address player, uint256 creditsUsed, uint256 goals)
        external onlyOwner
    {
        require(credits[player] >= creditsUsed, "Creditos insuficientes");
        credits[player] -= creditsUsed;
        totalGoals[player] += goals;
        gameHistory.push(Game({
            player: player,
            creditsUsed: creditsUsed,
            goals: goals,
            timestamp: block.timestamp
        }));
        emit GamePlayed(player, creditsUsed, goals);
    }

    // ─── Canjear créditos (inicia off-ramp en backend) ─────────────────
    function redeemCredits(uint256 amount) external {
        require(credits[msg.sender] >= amount, "Creditos insuficientes");
        require(amount > 0, "Monto debe ser > 0");
        credits[msg.sender] -= amount;
        emit CreditsRedeemed(msg.sender, amount);
    }

    // ─── Vista pública ──────────────────────────────────────────────────
    function getPlayerStats(address player)
        external view returns (uint256 playerCredits, uint256 playerGoals)
    {
        return (credits[player], totalGoals[player]);
    }

    function totalGames() external view returns (uint256) {
        return gameHistory.length;
    }

    // ─── Admin: transferir ownership ────────────────────────────────────
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Owner invalido");
        owner = newOwner;
    }
}
