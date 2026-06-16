/// Lightweight subsequence fuzzy scorer for quick-open (no extra deps).

pub fn fuzzy_score(query: &str, candidate: &str) -> Option<i32> {
    let q: Vec<char> = query.to_lowercase().chars().filter(|c| !c.is_whitespace()).collect();
    if q.is_empty() {
        return None;
    }
    let c: Vec<char> = candidate.to_lowercase().chars().collect();
    if c.is_empty() {
        return None;
    }

    let mut qi = 0;
    let mut score = 0i32;
    let mut prev_match: Option<usize> = None;
    let mut consecutive = 0i32;

    for (i, ch) in c.iter().enumerate() {
        if qi < q.len() && *ch == q[qi] {
            score += 5;
            if let Some(prev) = prev_match {
                if i == prev + 1 {
                    consecutive += 1;
                    score += 3 + consecutive;
                } else {
                    consecutive = 0;
                    score -= (i - prev) as i32;
                }
            }
            if i == 0 || c.get(i.wrapping_sub(1)).map(|p| *p == '/' || *p == '\\').unwrap_or(true) {
                score += 8;
            }
            prev_match = Some(i);
            qi += 1;
        }
    }

    if qi < q.len() {
        return None;
    }

    if candidate.to_lowercase() == query.to_lowercase() {
        score += 40;
    } else if candidate.to_lowercase().starts_with(&query.to_lowercase()) {
        score += 20;
    }

    Some(score)
}

#[cfg(test)]
mod tests {
    use super::fuzzy_score;

    #[test]
    fn fuzzy_matches_subsequence() {
        assert!(fuzzy_score("pg", "src/routes/+page.svelte").is_some());
    }

    #[test]
    fn fuzzy_rejects_non_match() {
        assert!(fuzzy_score("zzz", "src/main.ts").is_none());
    }
}