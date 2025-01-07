import random
from collections import deque
class GoapPlanner:
    def plan(self, agent, goals, most_recent_goal=None):
        ordered_goals = sorted(
            [g for g in goals if any(not b() for b in g.desired_effects)],
            key=lambda g: g.priority - 0.01 if g == most_recent_goal else g.priority,
            reverse=True
        )

        for goal in ordered_goals:
            goal_node = Node(None, None, goal.desired_effects, 0)
            if self.find_path(goal_node, agent.actions):
                if goal_node.is_leaf_dead:
                    continue

                action_stack = deque()
                while goal_node.leaves:
                    cheapest_leaf = min(goal_node.leaves, key=lambda leaf: leaf.cost)
                    goal_node = cheapest_leaf
                    action_stack.appendleft(cheapest_leaf.action)

                return ActionPlan(goal, action_stack, goal_node.cost)

        print("No plan found")
        return None

    def find_path(self, parent, actions):
        ordered_actions = sorted(actions, key=lambda a: a.cost)

        for action in ordered_actions:
            required_effects = set(parent.required_effects)
            required_effects = {b for b in required_effects if not b()}

            if not required_effects:
                return True

            if any(effect in required_effects for effect in action.effects):
                new_required_effects = required_effects - set(action.effects)
                new_required_effects.update(action.preconditions)

                new_available_actions = set(actions) - {action}
                new_node = Node(parent, action, new_required_effects, parent.cost + action.cost)

                if self.find_path(new_node, new_available_actions):
                    parent.leaves.append(new_node)
                    new_required_effects -= set(new_node.action.preconditions)

                if not new_required_effects:
                    return True

        return bool(parent.leaves)

class Node:
    def __init__(self, parent, action, effects, cost):
        self.parent = parent
        self.action = action
        self.required_effects = set(effects)
        self.leaves = []
        self.cost = cost

    @property
    def is_leaf_dead(self):
        return not self.leaves and self.action is None

class ActionPlan:
    def __init__(self, goal, actions, total_cost):
        self.goal = goal
        self.actions = actions
        self.total_cost = total_cost
class GoapAgent:
    def __init__(self, nav_mesh_agent, animation_controller, sensors, locations):
        self.nav_mesh_agent = nav_mesh_agent
        self.animations = animation_controller
        self.sensors = sensors
        self.locations = locations

        self.health = 100
        self.stamina = 100

        self.stats_timer = CountdownTimer(2.0, self.update_stats)
        self.stats_timer.start()

        self.target = None
        self.destination = None

        self.last_goal = None
        self.current_goal = None
        self.action_plan = None
        self.current_action = None

        self.beliefs = {}
        self.actions = set()
        self.goals = set()

        self.setup_beliefs()
        self.setup_actions()
        self.setup_goals()

    def setup_beliefs(self):
        self.beliefs = {
            "Nothing": lambda: False,
            "AgentIdle": lambda: not self.nav_mesh_agent.has_path(),
            "AgentMoving": lambda: self.nav_mesh_agent.has_path(),
            "AgentHealthLow": lambda: self.health < 30,
            "AgentIsHealthy": lambda: self.health >= 50,
            "AgentStaminaLow": lambda: self.stamina < 10,
            "AgentIsRested": lambda: self.stamina >= 50,
            "AgentAtDoorOne": lambda: self.in_range_of(self.locations['door_one'], 3),
            "AgentAtDoorTwo": lambda: self.in_range_of(self.locations['door_two'], 3),
            "AgentAtRestingPosition": lambda: self.in_range_of(self.locations['resting_position'], 3),
            "AgentAtFoodShack": lambda: self.in_range_of(self.locations['food_shack'], 3),
            "PlayerInChaseRange": lambda: self.sensors['chase_sensor'].is_target_in_range(),
            "PlayerInAttackRange": lambda: self.sensors['attack_sensor'].is_target_in_range(),
            "AttackingPlayer": lambda: False
        }

    def setup_actions(self):
        self.actions = {
            AgentAction("Relax", IdleStrategy(5), [self.beliefs["Nothing"]]),
            AgentAction("Wander Around", WanderStrategy(self.nav_mesh_agent, 10), [self.beliefs["AgentMoving"]]),
            AgentAction("MoveToEatingPosition", MoveStrategy(self.nav_mesh_agent, lambda: self.locations['food_shack'].position), [self.beliefs["AgentAtFoodShack"]]),
            AgentAction("Eat", IdleStrategy(5), [self.beliefs["AgentAtFoodShack"]], [self.beliefs["AgentIsHealthy"]]),
            AgentAction("MoveToDoorOne", MoveStrategy(self.nav_mesh_agent, lambda: self.locations['door_one'].position), [self.beliefs["AgentAtDoorOne"]]),
            AgentAction("MoveToDoorTwo", MoveStrategy(self.nav_mesh_agent, lambda: self.locations['door_two'].position), [self.beliefs["AgentAtDoorTwo"]]),
            AgentAction("MoveFromDoorOneToRestArea", MoveStrategy(self.nav_mesh_agent, lambda: self.locations['resting_position'].position), [self.beliefs["AgentAtDoorOne"]], [self.beliefs["AgentAtRestingPosition"]], cost=2),
            AgentAction("MoveFromDoorTwoRestArea", MoveStrategy(self.nav_mesh_agent, lambda: self.locations['resting_position'].position), [self.beliefs["AgentAtDoorTwo"]], [self.beliefs["AgentAtRestingPosition"]]),
            AgentAction("Rest", IdleStrategy(5), [self.beliefs["AgentAtRestingPosition"]], [self.beliefs["AgentIsRested"]]),
            AgentAction("ChasePlayer", MoveStrategy(self.nav_mesh_agent, lambda: self.sensors['chase_sensor'].target_position), [self.beliefs["PlayerInChaseRange"]], [self.beliefs["PlayerInAttackRange"]]),
            AgentAction("AttackPlayer", AttackStrategy(self.animations), [self.beliefs["PlayerInAttackRange"]], [self.beliefs["AttackingPlayer"]])
        }

    def setup_goals(self):
        self.goals = {
            AgentGoal("Chill Out", 1, [self.beliefs["Nothing"]]),
            AgentGoal("Wander", 1, [self.beliefs["AgentMoving"]]),
            AgentGoal("KeepHealthUp", 2, [self.beliefs["AgentIsHealthy"]]),
            AgentGoal("KeepStaminaUp", 2, [self.beliefs["AgentIsRested"]]),
            AgentGoal("SeekAndDestroy", 3, [self.beliefs["AttackingPlayer"]])
        }

    def update_stats(self):
        self.stamina += 20 if self.in_range_of(self.locations['resting_position'].position, 3) else -10
        self.health += 20 if self.in_range_of(self.locations['food_shack'].position, 3) else -5
        self.stamina = max(0, min(self.stamina, 100))
        self.health = max(0, min(self.health, 100))

    def in_range_of(self, pos, range):
        return (self.nav_mesh_agent.position - pos).magnitude() < range

    def update(self, delta_time):
        self.stats_timer.tick(delta_time)
        self.animations.set_speed(self.nav_mesh_agent.velocity.magnitude())

        if self.current_action is None:
            self.calculate_plan()

            if self.action_plan and self.action_plan.actions:
                self.nav_mesh_agent.reset_path()
                self.current_goal = self.action_plan.goal
                self.current_action = self.action_plan.actions.popleft()

                if all(precondition() for precondition in self.current_action.preconditions):
                    self.current_action.start()
                else:
                    self.current_action = None
                    self.current_goal = None

        if self.action_plan and self.current_action:
            self.current_action.update(delta_time)

            if self.current_action.complete:
                self.current_action.stop()
                self.current_action = None

                if not self.action_plan.actions:
                    self.last_goal = self.current_goal
                    self.current_goal = None

    def calculate_plan(self):
        priority_level = self.current_goal.priority if self.current_goal else 0
        goals_to_check = {goal for goal in self.goals if goal.priority > priority_level} if self.current_goal else self.goals

        potential_plan = self.g_planner.plan(self, goals_to_check, self.last_goal)
        if potential_plan:
            self.action_plan = potential_plan

class CountdownTimer:
    def __init__(self, duration, callback):
        self.duration = duration
        self.callback = callback
        self.time_left = duration

    def start(self):
        self.time_left = self.duration

    def tick(self, delta_time):
        self.time_left -= delta_time
        if self.time_left <= 0:
            self.callback()
            self.start()

class AgentAction:
    def __init__(self, name, strategy, preconditions, effects, cost=1):
        self.name = name
        self.strategy = strategy
        self.preconditions = preconditions
        self.effects = effects
        self.cost = cost
        self.complete = False

    def start(self):
        self.strategy.start()

    def update(self, delta_time):
        self.strategy.update(delta_time)
        self.complete = self.strategy.complete

    def stop(self):
        self.strategy.stop()

class AgentGoal:
    def __init__(self, name, priority, desired_effects):
        self.name = name
        self.priority = priority
        self.desired_effects = desired_effects
class IdleStrategy:
    def __init__(self, duration):
        self.duration = duration
        self.time_left = duration
        self.complete = False

    def start(self):
        self.time_left = self.duration

    def update(self, delta_time):
        self.time_left -= delta_time
        if self.time_left <= 0:
            self.complete = True

    def stop(self):
        pass

class WanderStrategy:
    def __init__(self, nav_mesh_agent, radius):
        self.nav_mesh_agent = nav_mesh_agent
        self.radius = radius
        self.complete = False

    def start(self):
        destination = self.nav_mesh_agent.position + random.uniform(-self.radius, self.radius)
        self.nav_mesh_agent.set_destination(destination)

    def update(self, delta_time):
        if not self.nav_mesh_agent.has_path():
            self.complete = True

    def stop(self):
        pass

class MoveStrategy:
    def __init__(self, nav_mesh_agent, destination_func):
        self.nav_mesh_agent = nav_mesh_agent
        self.destination_func = destination_func
        self.complete = False

    def start(self):
        self.nav_mesh_agent.set_destination(self.destination_func())

    def update(self, delta_time):
        if not self.nav_mesh_agent.has_path():
            self.complete = True

    def stop(self):
        pass

class AttackStrategy:
    def __init__(self, animations):
        self.animations = animations
        self.complete = False

    def start(self):
        self.animations.play_attack()

    def update(self, delta_time):
        self.complete = True

    def stop(self):
        pass
