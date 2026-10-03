def get_news_delay(research_level: int) -> int:
    """Returns news delay in seconds based on Research level."""
    delays = {0: 15, 1: 10, 2: 7, 3: 3} #[cite: 3]
    return delays.get(research_level, 15)

def can_receive_insider(research_level: int) -> bool:
    """Insider news only available at Research Level 2+."""
    return research_level >= 2 #[cite: 3]