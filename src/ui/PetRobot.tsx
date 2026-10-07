import { robotLook } from "../game/look";
import { useContent } from "./contexts";
import { useOptionalGame, type GameApi } from "./GameProvider";
import { Robot, type RobotMood } from "./Robot";

export interface PetRobotProps {
  /** A screen's own mood (happy, sad, thinking…); by default the state of the room. */
  mood?: RobotMood;
  size?: number;
}

/**
 * The child's Robo: its form, star and accessories come from the game, so it looks the same on every screen.
 * Outside a game (onboarding, errors) it is the plain capsule.
 */
export function PetRobot({ mood, size }: PetRobotProps) {
  const game = useOptionalGame();
  if (!game) return <Robot mood={mood} size={size} />;
  return <GameRobot game={game} mood={mood} size={size} />;
}

function GameRobot({ game, mood, size }: PetRobotProps & { game: GameApi }) {
  const look = robotLook(useContent(), game.state, game.today);
  return (
    <Robot mood={mood ?? look.state} size={size} form={look.form} graduated={look.graduated} equipped={look.equipped} />
  );
}
