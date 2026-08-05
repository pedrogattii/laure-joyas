# Graph Report - .  (2026-08-04)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 826 nodes · 1598 edges · 59 communities (41 shown, 18 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8f9942a6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- install_skill.py
- scripts
- SvgIcons.tsx
- compilerOptions
- DailyCashClosureModal.tsx
- supabaseSync.ts
- validate
- admin/page.tsx
- rest-api-template.py
- ProductsService
- compilerOptions
- InventoryService
- ProductItem
- package_skill
- app.module.ts
- SalesService
- frontend/package.json
- bundle_analyzer.py
- component_generator.py
- ArchitectureDiagramGenerator
- DependencyAnalyzer
- ProjectArchitect
- frontend_scaffolder.py
- CodeQualityAnalyzer
- FullstackScaffolder
- ProjectScaffolder
- devDependencies
- login/page.tsx
- devDependencies
- detect_skills.py
- PrismaService
- manifest.json
- UserManagementModal.tsx
- ToastContext.tsx
- seed.js
- nest-cli.json
- apply-schema.js
- @types/node
- eslint
- @eslint/eslintrc
- eslint-plugin-prettier
- jest
- @nestjs/cli
- @nestjs/schematics
- @nestjs/testing
- prettier
- prisma
- source-map-support
- supertest
- ts-jest
- @types/jest
- tsconfig-paths
- @types/express
- typescript-eslint
- frontend/eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `install_single()` - 26 edges
2. `useToast()` - 25 edges
3. `compilerOptions` - 22 edges
4. `ProductItem` - 21 edges
5. `validate()` - 19 edges
6. `main()` - 18 edges
7. `compilerOptions` - 16 edges
8. `rollback_skill()` - 15 edges
9. `Header()` - 15 edges
10. `safe_skill_path()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `exclude` --extends--> `node_modules`  [EXTRACTED]
  backend/tsconfig.build.json → frontend/tsconfig.json
- `POSRegisterModalProps` --references--> `ProductItem`  [EXTRACTED]
  frontend/src/components/admin/POSRegisterModal.tsx → frontend/src/lib/types.ts
- `ProductFormModalProps` --references--> `ProductItem`  [EXTRACTED]
  frontend/src/components/admin/ProductFormModal.tsx → frontend/src/lib/types.ts
- `step1_resolve_source()` --calls--> `detect()`  [EXTRACTED]
  .agents/skills/skill-installer/scripts/install_skill.py → .agents/skills/skill-installer/scripts/detect_skills.py
- `step2_validate()` --calls--> `validate()`  [EXTRACTED]
  .agents/skills/skill-installer/scripts/install_skill.py → .agents/skills/skill-installer/scripts/validate_skill.py

## Import Cycles
- None detected.

## Communities (59 total, 18 thin omitted)

### Community 0 - "install_skill.py"
Cohesion: 0.06
Nodes (75): append_log(), _backup_ignore(), _C, cleanup_old_backups(), compare_versions(), copy_tree_contents(), _fail(), get_all_skill_dirs() (+67 more)

### Community 1 - "scripts"
Cohesion: 0.04
Nodes (47): author, dependencies, @nestjs/common, @nestjs/core, @nestjs/platform-express, @prisma/adapter-pg, @prisma/client, reflect-metadata (+39 more)

### Community 2 - "SvgIcons.tsx"
Cohesion: 0.14
Nodes (20): ProductDetailPage(), FavoritosPage(), CashClosureHistoryModalProps, Footer(), Header(), CartIcon(), ClockIcon(), HeartFilledIcon() (+12 more)

### Community 3 - "compilerOptions"
Cohesion: 0.06
Nodes (34): exclude, extends, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx (+26 more)

### Community 4 - "DailyCashClosureModal.tsx"
Cohesion: 0.11
Nodes (27): CashClosureHistoryModal(), DailyCashClosureModal(), DailyCashClosureModalProps, ExpenseFormModal(), ExpenseFormModalProps, MovementReportModal(), MovementReportModalProps, CashClosureRecord (+19 more)

### Community 5 - "supabaseSync.ts"
Cohesion: 0.13
Nodes (23): RFC-4122, CatalogPage(), AnalyticsDashboard(), AnalyticsDashboardProps, ProductFormModal(), ProductFormModalProps, SearchIcon(), compressAndConvertToWebP() (+15 more)

### Community 6 - "validate"
Cohesion: 0.14
Nodes (28): check_description_exists(), check_description_length(), check_duplicate_name(), check_forbidden_files(), check_frontmatter_parseable(), check_name_exists(), check_name_matches_dir(), check_scripts_requirements() (+20 more)

### Community 7 - "admin/page.tsx"
Cohesion: 0.21
Nodes (25): AdminPage(), CheckoutPage(), HomePage(), MobilePosAppPage(), POSRegisterModal(), POSRegisterModalProps, StockAdjustModal(), CashIcon() (+17 more)

### Community 8 - "rest-api-template.py"
Cohesion: 0.13
Nodes (26): create_user(), delete_user(), ErrorDetail, ErrorResponse, get_user(), http_exception_handler(), list_users(), PaginatedResponse (+18 more)

### Community 9 - "ProductsService"
Cohesion: 0.13
Nodes (13): ProductsController, Body, Controller, Delete, Get, Param, Patch, Post (+5 more)

### Community 10 - "compilerOptions"
Cohesion: 0.09
Nodes (22): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+14 more)

### Community 11 - "InventoryService"
Cohesion: 0.15
Nodes (11): InventoryController, Body, Controller, Get, Post, Query, InventoryModule, Module (+3 more)

### Community 12 - "ProductItem"
Cohesion: 0.12
Nodes (17): bricolage, cormorant, inter, metadata, playfair, viewport, StockAdjustModalProps, CartDrawer() (+9 more)

### Community 13 - "package_skill"
Cohesion: 0.20
Nodes (20): main(), package_all(), package_skill(), parse_yaml_frontmatter(), Path, Validate skill meets Claude.ai web upload requirements., Check if a file should be included in the ZIP., Package a skill directory into a ZIP file for Claude.ai upload. The ZIP format… (+12 more)

### Community 14 - "app.module.ts"
Cohesion: 0.15
Nodes (11): AppController, Controller, Get, AppModule, Module, AppService, Injectable, ProductsModule (+3 more)

### Community 15 - "SalesService"
Cohesion: 0.15
Nodes (11): SalesController, Body, Controller, Get, Param, Post, Query, CreateSaleDto (+3 more)

### Community 16 - "frontend/package.json"
Cohesion: 0.11
Nodes (17): dependencies, next, react, react-dom, @supabase/supabase-js, name, private, scripts (+9 more)

### Community 17 - "bundle_analyzer.py"
Cohesion: 0.20
Nodes (16): analyze_dependencies(), analyze_imports(), calculate_score(), check_nextjs_config(), load_package_json(), main(), print_report(), Path (+8 more)

### Community 18 - "component_generator.py"
Cohesion: 0.24
Nodes (15): generate_component(), main(), print_result(), Path, Convert string to PascalCase., Convert PascalCase to kebab-case., Generate component files., Print generation result. (+7 more)

### Community 19 - "ArchitectureDiagramGenerator"
Cohesion: 0.20
Nodes (9): ArchitectureDiagramGenerator, main(), Resolve a CLI path under the current workspace., Main class for architecture diagram generator functionality, Execute the main functionality, Validate the target path exists and is accessible, Perform the main analysis or operation, Generate and display the report (+1 more)

### Community 20 - "DependencyAnalyzer"
Cohesion: 0.20
Nodes (9): DependencyAnalyzer, main(), Resolve a CLI path under the current workspace., Main class for dependency analyzer functionality, Execute the main functionality, Validate the target path exists and is accessible, Perform the main analysis or operation, Generate and display the report (+1 more)

### Community 21 - "ProjectArchitect"
Cohesion: 0.20
Nodes (9): main(), ProjectArchitect, Resolve a CLI path under the current workspace., Main class for project architect functionality, Execute the main functionality, Validate the target path exists and is accessible, Perform the main analysis or operation, Generate and display the report (+1 more)

### Community 22 - "frontend_scaffolder.py"
Cohesion: 0.22
Nodes (14): generate_config_files(), generate_structure(), get_config_templates(), main(), print_result(), Path, Resolve a CLI path under the current workspace., Generate directory structure recursively. (+6 more)

### Community 23 - "CodeQualityAnalyzer"
Cohesion: 0.20
Nodes (9): CodeQualityAnalyzer, main(), Resolve a CLI path under the current workspace., Main class for code quality analyzer functionality, Execute the main functionality, Validate the target path exists and is accessible, Perform the main analysis or operation, Generate and display the report (+1 more)

### Community 24 - "FullstackScaffolder"
Cohesion: 0.20
Nodes (9): FullstackScaffolder, main(), Resolve a CLI path under the current workspace., Main class for fullstack scaffolder functionality, Execute the main functionality, Validate the target path exists and is accessible, Perform the main analysis or operation, Generate and display the report (+1 more)

### Community 25 - "ProjectScaffolder"
Cohesion: 0.20
Nodes (9): main(), ProjectScaffolder, Resolve a CLI path under the current workspace., Main class for project scaffolder functionality, Execute the main functionality, Validate the target path exists and is accessible, Perform the main analysis or operation, Generate and display the report (+1 more)

### Community 26 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint-config-prettier, @eslint/js, globals, pg, ts-loader, ts-node, @types/supertest (+7 more)

### Community 27 - "login/page.tsx"
Cohesion: 0.17
Nodes (11): LoginPage(), GoogleIcon(), AuthContext, AuthContextType, AuthProvider(), OFFICIAL_DEMO_ACCOUNTS, UserRole, UserSession (+3 more)

### Community 28 - "devDependencies"
Cohesion: 0.14
Nodes (14): typescript, typescript, eslint-config-next, devDependencies, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/react (+6 more)

### Community 29 - "detect_skills.py"
Cohesion: 0.29
Nodes (12): _classify_location(), detect(), find_skill_candidates(), get_installed_skill_names(), main(), parse_yaml_frontmatter(), Path, Find SKILL.md files in given locations. (+4 more)

### Community 30 - "PrismaService"
Cohesion: 0.20
Nodes (5): PrismaModule, Module, PrismaService, Injectable, Global

### Community 31 - "manifest.json"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 32 - "UserManagementModal.tsx"
Cohesion: 0.32
Nodes (7): UserManagementModal(), UserManagementModalProps, GearIcon(), UserIcon(), ManagedUser, updateSupabaseUserRole(), useSupabaseUsers()

### Community 33 - "ToastContext.tsx"
Cohesion: 0.32
Nodes (7): getToastIcon(), getToastStyles(), Toast, ToastContext, ToastContextType, ToastProvider(), ToastType

### Community 34 - "seed.js"
Cohesion: 0.29
Nodes (5): adapter, { Pool }, prisma, { PrismaClient }, { PrismaPg }

### Community 35 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 36 - "apply-schema.js"
Cohesion: 0.50
Nodes (4): { Client }, fs, main(), path

### Community 37 - "@types/node"
Cohesion: 0.67
Nodes (3): @types/node, @types/node, @types/node

### Community 38 - "eslint"
Cohesion: 0.67
Nodes (3): eslint, eslint, eslint

## Knowledge Gaps
- **170 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `name` (+165 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `scripts`, `devDependencies`, `@types/node`, `eslint`, `@eslint/eslintrc`, `eslint-plugin-prettier`, `jest`, `@nestjs/cli`, `@nestjs/schematics`, `@nestjs/testing`, `prettier`, `prisma`, `source-map-support`, `supertest`, `ts-jest`, `@types/jest`, `tsconfig-paths`, `@types/express`, `typescript-eslint`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `frontend/package.json`, `@types/node`, `eslint`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `package_skill()` connect `package_skill` to `install_skill.py`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _170 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `install_skill.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06435498089920658 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.041666666666666664 - nodes in this community are weakly interconnected._
- **Should `SvgIcons.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1423076923076923 - nodes in this community are weakly interconnected._