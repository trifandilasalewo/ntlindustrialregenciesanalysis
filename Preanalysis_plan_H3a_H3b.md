> Numbering note added 9 Oct 2026, after all estimates (content below unchanged): in the manuscript, H1 stays H1, H3 becomes H2 (confirmatory), H7 becomes H3a (confirmatory), H8 becomes H3b, H2 and H4 are reported as the level and curvature terms, and H5–H6 are reported as tests S1–S2 in the Appendix (Table 14).

# Pre-analysis plan: does the start of operations change sectoral structure? (written 9 Oct 2026, before any estimate)

## Question
Do regencies change their sectoral structure after a large facility starts commercial operation?
(This differs from H5: H5 asked whether light follows concentration; this asks whether the facility shifts structure.)

## Design (fixed now)
- Estimator: Callaway & Sant'Anna staggered DiD, exactly as in the existing supplementary event study
  (same treated/control definition, universal base period, regression adjustment, clustered multiplier bootstrap 9,999 draws, seed 2026).
- Treated: industrial units whose documented start year falls within the panel (2016–2024).
  Controls: never-treated (42 non-industrial units). Always-treated units and units without a sourced start year are excluded.
- Outcomes (17-industry data):
  - HHI_it (×100), the Herfindahl index of GRDP shares across 17 industries;
  - BC_it, the share of mining (B) + manufacturing (C) in GRDP (%).
- Years: 2015–2024 (balanced; 2025 excluded because Luwu Utara has no 2025 breakdown and 2025 is "very preliminary").

## Hypotheses (third family; Holm correction within the family)
- H7 (confirmatory): the overall (simple) ATT on HHI is positive.
- H8 (supporting): the overall ATT on the B+C share is positive.
- Decision rule: supported if ATT > 0 and bootstrap-based p < 0.05 after Holm (raw p also reported).

## Reported regardless of result
- Event-time profile (−5 to +5) with 95% simultaneous bands; number of pre-period bands excluding zero (pre-trend check).
- Robustness: not-yet-treated controls; 2015–2025 without Luwu Utara; leave one treated unit out (range, number positive, number significant).

## Interpretation
- Positive ATTs are read as structural change following start-up, conditional on parallel trends; a pre-trend weakens that reading.
- Null results are reported as nulls. Nothing in H1–H6 changes.
