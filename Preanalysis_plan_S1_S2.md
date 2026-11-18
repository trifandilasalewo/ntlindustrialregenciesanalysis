> Numbering note added 9 Oct 2026, after all estimates (content below unchanged): in the manuscript, H1 stays H1, H3 becomes H2 (confirmatory), H7 becomes H3a (confirmatory), H8 becomes H3b, H2 and H4 are reported as the level and curvature terms, and H5–H6 are reported as tests S1–S2 in the Appendix (Table 14).

# Pre-analysis plan: nighttime light and sectoral structure (written 9 Oct 2026, before the 17-sector data were seen)

## Data
- GRDP at current prices (ADHB) by 17 BPS industry categories (A–U grouping), 79 regencies/cities, 2015–2025 or the longest available span.
- Shares s_kit = GRDP_kit / Σ_k GRDP_kit (sum of the 17 categories; check against total GRDP, tolerance 1%).

## Measures (fixed now)
1. Concentration: HHI_it = Σ_k s_kit² (0–1).
2. Diversification: entropy D_it = −Σ_k s_kit ln s_kit / ln 17 (0–1).
3. Annual structural change: SCI_it = ½ Σ_k |s_kit − s_ki,t−1| (share of output reallocated between sectors; 0–1).

## Hypotheses (new family; Holm correction within this family)
- H5 (confirmatory for this section): within industrial regencies, rising light accompanies rising sectoral concentration.
  Test: two-way CRE, outcome HHI_it, regressors ln NTL, Ind, ln NTL × Ind, controls as in the main model, unit means, year effects.
  Supported if the coefficient on ln NTL × Ind is > 0 and WCR p < 0.05 (Holm-adjusted p reported).
- H6 (supporting): years of faster structural change coincide with faster growth of light in industrial regencies.
  Test: outcome SCI_it, regressor Δln NTL_it, Δln NTL × Ind, year effects, regency effects.
  Supported if the coefficient on Δln NTL × Ind is > 0 and WCR p < 0.05.

## Inference and robustness (all reported, whatever the result)
- WCR bootstrap, 9,999 Rademacher draws, clustered by regency; Holm over H5–H6.
- Entropy D in place of HHI (expected sign negative).
- 2015–2021 only (single VNL version).
- Excluding Morowali and Halmahera Tengah.
- Leave one province out.
- Descriptive: HHI by group and year; map of the change in HHI between the first and last year.

## Interpretation rules
- A positive H5 means light tracks concentration of output in few sectors (enclave-type structural change), not diversification.
- A null H5 is reported as a null; the main H1–H4 results are not changed by this section.
- No causal language: associations only.
