<!-- markdownlint-disable-file -->
# 📋 PLANO DE AÇÃO - BACKEND (API C# .NET)

**Objetivo:** Desenvolver API REST para suportar MVP do ERP ARJSYS
**Tecnologia:** ASP.NET Core 8 + Minimal API + Entity Framework Core
**Banco de Dados:** SQL Server ou PostgreSQL
**Prazo estimado:** 8-10 semanas (paralelo ao frontend)

---

## 🎯 ESTRATÉGIA BACKEND

### Arquitetura Simples e Direta
- **Minimal API** (sem controllers pesados)
- **Entity Framework Core** (Code First)
- **Repository Pattern** (opcional, pode ser direto no endpoint)
- **DTOs** para contratos da API
- **AutoMapper** para conversões
- **FluentValidation** para validações

### Foco em Velocidade
- Setup rápido com templates
- Migrations automáticas em dev
- Seed data para testes
- Swagger configurado
- CORS liberado para desenvolvimento

---

## 📊 CRONOGRAMA BACKEND

| Semana | Fase | Entregas |
|--------|------|----------|
| 1 | Setup + Produtos | Projeto base + CRUD Produtos |
| 2-3 | Estruturas (BOM) | CRUD Estruturas + Recursão |
| 3-4 | Upload + Desenhos | Storage + API Desenhos |
| 4-5 | Clientes + Pedidos | CRUD Clientes/Pedidos |
| 5-6 | Explosão BOM | Serviço recursivo + Relatórios |
| 6-7 | Dashboard + Queries | Métricas e agregações |
| 7-8 | Testes + Deploy | Testes + Docker/Deploy |

---

## 🚀 FASE 1 - SETUP + PRODUTOS (Semana 1)

---

### ⚙️ FASE 1.1 - Setup Inicial do Projeto

#### **Objetivo:** Criar estrutura base da API

---

#### 1.1.1 - Criar Projeto
- [ ] Criar solution
  ```bash
  dotnet new sln -n ArjSys
  ```

- [ ] Criar projeto API
  ```bash
  dotnet new webapi -n ArjSys.Api -minimal
  cd ArjSys.Api
  ```

- [ ] Adicionar projeto à solution
  ```bash
  dotnet sln add ArjSys.Api/ArjSys.Api.csproj
  ```

- [ ] Estrutura de pastas
  ```
  ArjSys.Api/
  ├── Data/
  │   ├── AppDbContext.cs
  │   └── Migrations/
  ├── Models/
  │   ├── Produto.cs
  │   ├── EstruturaProduto.cs
  │   ├── ComponenteBOM.cs
  │   ├── Cliente.cs
  │   ├── Pedido.cs
  │   └── Usuario.cs
  ├── DTOs/
  │   ├── ProdutoDto.cs
  │   ├── CreateProdutoDto.cs
  │   └── ...
  ├── Services/
  │   ├── ExplosaoMaterialService.cs
  │   ├── UploadService.cs
  │   └── ...
  ├── Endpoints/
  │   ├── ProdutosEndpoints.cs
  │   ├── EstruturasEndpoints.cs
  │   └── ...
  ├── Validators/
  │   ├── ProdutoValidator.cs
  │   └── ...
  └── Program.cs
  ```

---

#### 1.1.2 - Instalar Pacotes NuGet
- [ ] Entity Framework Core
  ```bash
  dotnet add package Microsoft.EntityFrameworkCore
  dotnet add package Microsoft.EntityFrameworkCore.SqlServer
  # OU
  dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
  dotnet add package Microsoft.EntityFrameworkCore.Tools
  dotnet add package Microsoft.EntityFrameworkCore.Design
  ```

- [ ] AutoMapper
  ```bash
  dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
  ```

- [ ] FluentValidation
  ```bash
  dotnet add package FluentValidation.AspNetCore
  ```

- [ ] Swagger/OpenAPI (já vem no template, mas verificar)
  ```bash
  dotnet add package Swashbuckle.AspNetCore
  ```

- [ ] JWT Authentication
  ```bash
  dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
  ```

- [ ] Outros úteis
  ```bash
  dotnet add package Serilog.AspNetCore
  dotnet add package Microsoft.AspNetCore.Cors
  ```

---

#### 1.1.3 - Configurar appsettings.json
- [ ] Configurar connection string
  ```json
  {
    "ConnectionStrings": {
      "DefaultConnection": "Server=localhost;Database=ArjSysDB;Trusted_Connection=True;TrustServerCertificate=True;"
      // PostgreSQL: "Host=localhost;Database=arjsysdb;Username=postgres;Password=senha"
    },
    "Jwt": {
      "Key": "chave-secreta-super-segura-aqui-pelo-menos-32-caracteres",
      "Issuer": "ArjSys.Api",
      "Audience": "ArjSys.Frontend",
      "ExpiryMinutes": 1440
    },
    "FileStorage": {
      "BasePath": "./uploads",
      "MaxFileSizeMB": 10,
      "AllowedExtensions": [".pdf", ".dwg", ".dxf", ".png", ".jpg", ".jpeg"]
    },
    "Logging": {
      "LogLevel": {
        "Default": "Information",
        "Microsoft.AspNetCore": "Warning"
      }
    },
    "AllowedHosts": "*"
  }
  ```

- [ ] Configurar appsettings.Development.json
  ```json
  {
    "ConnectionStrings": {
      "DefaultConnection": "Server=localhost;Database=ArjSysDB_Dev;..."
    },
    "Logging": {
      "LogLevel": {
        "Default": "Debug"
      }
    }
  }
  ```

---

#### 1.1.4 - Configurar CORS no Program.cs
- [ ] Adicionar configuração CORS
  ```csharp
  var builder = WebApplication.CreateBuilder(args);

  // CORS para desenvolvimento
  builder.Services.AddCors(options =>
  {
      options.AddPolicy("AllowFrontend", policy =>
      {
          policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
      });
  });

  var app = builder.Build();

  app.UseCors("AllowFrontend");
  ```

---

#### 1.1.5 - Configurar Swagger
- [ ] Configurar Swagger com autenticação JWT
  ```csharp
  builder.Services.AddEndpointsApiExplorer();
  builder.Services.AddSwaggerGen(options =>
  {
      options.SwaggerDoc("v1", new OpenApiInfo
      {
          Title = "ArjSys API",
          Version = "v1",
          Description = "API do ERP ArjSys - Gestão Industrial"
      });

      // JWT no Swagger
      options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
      {
          Name = "Authorization",
          Type = SecuritySchemeType.Http,
          Scheme = "Bearer",
          BearerFormat = "JWT",
          In = ParameterLocation.Header,
          Description = "JWT Authorization header usando Bearer scheme. Exemplo: 'Bearer {token}'"
      });

      options.AddSecurityRequirement(new OpenApiSecurityRequirement
      {
          {
              new OpenApiSecurityScheme
              {
                  Reference = new OpenApiReference
                  {
                      Type = ReferenceType.SecurityScheme,
                      Id = "Bearer"
                  }
              },
              Array.Empty<string>()
          }
      });
  });

  // ...

  if (app.Environment.IsDevelopment())
  {
      app.UseSwagger();
      app.UseSwaggerUI();
  }
  ```

---

### 📦 FASE 1.2 - Model Produto + CRUD

#### **Objetivo:** Implementar CRUD completo de produtos

---

#### 1.2.1 - Criar Model Produto
- [ ] Criar `Models/Produto.cs`
  ```csharp
  using System.ComponentModel.DataAnnotations;

  namespace ArjSys.Api.Models;

  public class Produto
  {
      [Key]
      public Guid Id { get; set; } = Guid.NewGuid();

      [Required]
      [MaxLength(50)]
      public string Codigo { get; set; } = string.Empty;

      [Required]
      [MaxLength(100)]
      public string DescricaoCurta { get; set; } = string.Empty;

      [MaxLength(500)]
      public string? DescricaoCompleta { get; set; }

      [Required]
      [MaxLength(10)]
      public string Unidade { get; set; } = string.Empty; // UN, KG, M, M2, L

      public decimal? PesoEstimado { get; set; }

      public int? TempoFabricacao { get; set; } // em horas

      [Required]
      [MaxLength(20)]
      public string Tipo { get; set; } = string.Empty; // FABRICADO, COMPRADO, MATERIA_PRIMA

      public bool PossuiDesenho { get; set; }

      [MaxLength(500)]
      public string? CaminhoDesenho { get; set; }

      public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

      public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

      // Navegação
      public virtual ICollection<ComponenteBOM> ComponentesComoFilho { get; set; } = new List<ComponenteBOM>();
  }
  ```

---

#### 1.2.2 - Criar DTOs
- [ ] Criar `DTOs/ProdutoDto.cs`
  ```csharp
  namespace ArjSys.Api.DTOs;

  public record ProdutoDto(
      Guid Id,
      string Codigo,
      string DescricaoCurta,
      string? DescricaoCompleta,
      string Unidade,
      decimal? PesoEstimado,
      int? TempoFabricacao,
      string Tipo,
      bool PossuiDesenho,
      string? CaminhoDesenho,
      DateTime CreatedAt,
      DateTime UpdatedAt
  );
  ```

- [ ] Criar `DTOs/CreateProdutoDto.cs`
  ```csharp
  namespace ArjSys.Api.DTOs;

  public record CreateProdutoDto(
      string Codigo,
      string DescricaoCurta,
      string? DescricaoCompleta,
      string Unidade,
      decimal? PesoEstimado,
      int? TempoFabricacao,
      string Tipo,
      bool PossuiDesenho
  );
  ```

- [ ] Criar `DTOs/UpdateProdutoDto.cs`
  ```csharp
  namespace ArjSys.Api.DTOs;

  public record UpdateProdutoDto(
      string DescricaoCurta,
      string? DescricaoCompleta,
      string Unidade,
      decimal? PesoEstimado,
      int? TempoFabricacao,
      string Tipo,
      bool PossuiDesenho
  );
  ```

---

#### 1.2.3 - Criar DbContext
- [ ] Criar `Data/AppDbContext.cs`
  ```csharp
  using ArjSys.Api.Models;
  using Microsoft.EntityFrameworkCore;

  namespace ArjSys.Api.Data;

  public class AppDbContext : DbContext
  {
      public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

      public DbSet<Produto> Produtos => Set<Produto>();
      public DbSet<EstruturaProduto> Estruturas => Set<EstruturaProduto>();
      public DbSet<ComponenteBOM> ComponentesBOM => Set<ComponenteBOM>();
      public DbSet<Cliente> Clientes => Set<Cliente>();
      public DbSet<Pedido> Pedidos => Set<Pedido>();
      public DbSet<Usuario> Usuarios => Set<Usuario>();

      protected override void OnModelCreating(ModelBuilder modelBuilder)
      {
          base.OnModelCreating(modelBuilder);

          // Produto
          modelBuilder.Entity<Produto>(entity =>
          {
              entity.HasKey(e => e.Id);
              entity.HasIndex(e => e.Codigo).IsUnique();
              entity.Property(e => e.PesoEstimado).HasPrecision(10, 2);
          });

          // Outras configurações serão adicionadas conforme criarmos os models
      }
  }
  ```

- [ ] Registrar DbContext no Program.cs
  ```csharp
  using ArjSys.Api.Data;
  using Microsoft.EntityFrameworkCore;

  var builder = WebApplication.CreateBuilder(args);

  // DbContext
  builder.Services.AddDbContext<AppDbContext>(options =>
      options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
      // OU para PostgreSQL:
      // options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
  );
  ```

---

#### 1.2.4 - Criar Migration e Atualizar DB
- [ ] Criar migration inicial
  ```bash
  dotnet ef migrations add InitialCreate
  ```

- [ ] Aplicar migration
  ```bash
  dotnet ef database update
  ```

- [ ] Verificar criação do banco e tabelas

---

#### 1.2.5 - Criar Seed Data
- [ ] Criar `Data/DbInitializer.cs`
  ```csharp
  namespace ArjSys.Api.Data;

  public static class DbInitializer
  {
      public static async Task SeedAsync(AppDbContext context)
      {
          // Produtos de exemplo
          if (!context.Produtos.Any())
          {
              var produtos = new[]
              {
                  new Produto
                  {
                      Codigo = "PRD-001",
                      DescricaoCurta = "Trator Agrícola Completo",
                      Unidade = "UN",
                      PesoEstimado = 2500,
                      TempoFabricacao = 160,
                      Tipo = "FABRICADO",
                      PossuiDesenho = true
                  },
                  new Produto
                  {
                      Codigo = "PRD-100",
                      DescricaoCurta = "Chassi Principal",
                      Unidade = "UN",
                      PesoEstimado = 800,
                      TempoFabricacao = 40,
                      Tipo = "FABRICADO",
                      PossuiDesenho = true
                  },
                  new Produto
                  {
                      Codigo = "CMP-050",
                      DescricaoCurta = "Rolamento SKF UC-200",
                      Unidade = "UN",
                      PesoEstimado = 2,
                      Tipo = "COMPRADO",
                      PossuiDesenho = false
                  },
                  // ... mais produtos
              };

              await context.Produtos.AddRangeAsync(produtos);
              await context.SaveChangesAsync();
          }
      }
  }
  ```

- [ ] Chamar seed no Program.cs
  ```csharp
  using (var scope = app.Services.CreateScope())
  {
      var services = scope.ServiceProvider;
      try
      {
          var context = services.GetRequiredService<AppDbContext>();
          await context.Database.MigrateAsync();
          await DbInitializer.SeedAsync(context);
      }
      catch (Exception ex)
      {
          var logger = services.GetRequiredService<ILogger<Program>>();
          logger.LogError(ex, "Erro ao aplicar migrations ou seed");
      }
  }
  ```

---

#### 1.2.6 - Criar Validator
- [ ] Criar `Validators/ProdutoValidator.cs`
  ```csharp
  using ArjSys.Api.DTOs;
  using FluentValidation;

  namespace ArjSys.Api.Validators;

  public class CreateProdutoDtoValidator : AbstractValidator<CreateProdutoDto>
  {
      public CreateProdutoDtoValidator()
      {
          RuleFor(x => x.Codigo)
              .NotEmpty()
              .MaximumLength(50)
              .Matches("^[A-Z0-9-]+$").WithMessage("Código deve conter apenas letras maiúsculas, números e hífen");

          RuleFor(x => x.DescricaoCurta)
              .NotEmpty()
              .MaximumLength(100);

          RuleFor(x => x.DescricaoCompleta)
              .MaximumLength(500)
              .When(x => !string.IsNullOrEmpty(x.DescricaoCompleta));

          RuleFor(x => x.Unidade)
              .NotEmpty()
              .Must(u => new[] { "UN", "KG", "M", "M2", "M3", "L" }.Contains(u))
              .WithMessage("Unidade inválida");

          RuleFor(x => x.PesoEstimado)
              .GreaterThanOrEqualTo(0)
              .When(x => x.PesoEstimado.HasValue);

          RuleFor(x => x.TempoFabricacao)
              .GreaterThanOrEqualTo(0)
              .When(x => x.TempoFabricacao.HasValue);

          RuleFor(x => x.Tipo)
              .NotEmpty()
              .Must(t => new[] { "FABRICADO", "COMPRADO", "MATERIA_PRIMA" }.Contains(t))
              .WithMessage("Tipo inválido");
      }
  }
  ```

- [ ] Registrar validators no Program.cs
  ```csharp
  using FluentValidation;

  builder.Services.AddValidatorsFromAssemblyContaining<CreateProdutoDtoValidator>();
  ```

---

#### 1.2.7 - Configurar AutoMapper
- [ ] Criar `Mappings/MappingProfile.cs`
  ```csharp
  using ArjSys.Api.DTOs;
  using ArjSys.Api.Models;
  using AutoMapper;

  namespace ArjSys.Api.Mappings;

  public class MappingProfile : Profile
  {
      public MappingProfile()
      {
          CreateMap<Produto, ProdutoDto>();
          CreateMap<CreateProdutoDto, Produto>();
          CreateMap<UpdateProdutoDto, Produto>()
              .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
      }
  }
  ```

- [ ] Registrar AutoMapper no Program.cs
  ```csharp
  builder.Services.AddAutoMapper(typeof(MappingProfile));
  ```

---

#### 1.2.8 - Criar Endpoints de Produtos
- [ ] Criar `Endpoints/ProdutosEndpoints.cs`
  ```csharp
  using ArjSys.Api.Data;
  using ArjSys.Api.DTOs;
  using ArjSys.Api.Models;
  using ArjSys.Api.Validators;
  using AutoMapper;
  using FluentValidation;
  using Microsoft.EntityFrameworkCore;

  namespace ArjSys.Api.Endpoints;

  public static class ProdutosEndpoints
  {
      public static void MapProdutosEndpoints(this WebApplication app)
      {
          var group = app.MapGroup("/api/produtos").WithTags("Produtos");

          // GET /api/produtos
          group.MapGet("/", async (AppDbContext db, IMapper mapper, 
              string? search, string? tipo, bool? possuiDesenho) =>
          {
              var query = db.Produtos.AsQueryable();

              if (!string.IsNullOrEmpty(search))
              {
                  query = query.Where(p => 
                      p.Codigo.Contains(search) || 
                      p.DescricaoCurta.Contains(search));
              }

              if (!string.IsNullOrEmpty(tipo))
              {
                  query = query.Where(p => p.Tipo == tipo);
              }

              if (possuiDesenho.HasValue)
              {
                  query = query.Where(p => p.PossuiDesenho == possuiDesenho.Value);
              }

              var produtos = await query
                  .OrderBy(p => p.Codigo)
                  .ToListAsync();

              return Results.Ok(mapper.Map<List<ProdutoDto>>(produtos));
          })
          .WithName("GetProdutos")
          .Produces<List<ProdutoDto>>(200);

          // GET /api/produtos/{id}
          group.MapGet("/{id:guid}", async (Guid id, AppDbContext db, IMapper mapper) =>
          {
              var produto = await db.Produtos.FindAsync(id);

              return produto is null
                  ? Results.NotFound(new { message = "Produto não encontrado" })
                  : Results.Ok(mapper.Map<ProdutoDto>(produto));
          })
          .WithName("GetProdutoById")
          .Produces<ProdutoDto>(200)
          .Produces(404);

          // POST /api/produtos
          group.MapPost("/", async (CreateProdutoDto dto, AppDbContext db, IMapper mapper, 
              IValidator<CreateProdutoDto> validator) =>
          {
              // Validar
              var validationResult = await validator.ValidateAsync(dto);
              if (!validationResult.IsValid)
              {
                  return Results.BadRequest(validationResult.Errors);
              }

              // Verificar código duplicado
              if (await db.Produtos.AnyAsync(p => p.Codigo == dto.Codigo))
              {
                  return Results.BadRequest(new { message = "Código já existe" });
              }

              var produto = mapper.Map<Produto>(dto);
              produto.CreatedAt = DateTime.UtcNow;
              produto.UpdatedAt = DateTime.UtcNow;

              db.Produtos.Add(produto);
              await db.SaveChangesAsync();

              var produtoDto = mapper.Map<ProdutoDto>(produto);

              return Results.Created($"/api/produtos/{produto.Id}", produtoDto);
          })
          .WithName("CreateProduto")
          .Produces<ProdutoDto>(201)
          .Produces(400);

          // PUT /api/produtos/{id}
          group.MapPut("/{id:guid}", async (Guid id, UpdateProdutoDto dto, 
              AppDbContext db, IMapper mapper) =>
          {
              var produto = await db.Produtos.FindAsync(id);
              if (produto is null)
              {
                  return Results.NotFound(new { message = "Produto não encontrado" });
              }

              mapper.Map(dto, produto);
              produto.UpdatedAt = DateTime.UtcNow;

              await db.SaveChangesAsync();

              return Results.Ok(mapper.Map<ProdutoDto>(produto));
          })
          .WithName("UpdateProduto")
          .Produces<ProdutoDto>(200)
          .Produces(404);

          // DELETE /api/produtos/{id}
          group.MapDelete("/{id:guid}", async (Guid id, AppDbContext db) =>
          {
              var produto = await db.Produtos.FindAsync(id);
              if (produto is null)
              {
                  return Results.NotFound(new { message = "Produto não encontrado" });
              }

              // Verificar se está em uso (estruturas, pedidos)
              var emUso = await db.ComponentesBOM.AnyAsync(c => c.ProdutoFilhoId == id);
              if (emUso)
              {
                  return Results.BadRequest(new { message = "Produto em uso, não pode ser excluído" });
              }

              db.Produtos.Remove(produto);
              await db.SaveChangesAsync();

              return Results.NoContent();
          })
          .WithName("DeleteProduto")
          .Produces(204)
          .Produces(404)
          .Produces(400);
      }
  }
  ```

- [ ] Registrar endpoints no Program.cs
  ```csharp
  using ArjSys.Api.Endpoints;

  // ... (após app.UseAuthorization())

  app.MapProdutosEndpoints();
  ```

---

#### 1.2.9 - Testar Endpoints
- [ ] Executar API
  ```bash
  dotnet run
  ```

- [ ] Abrir Swagger: `https://localhost:7xxx/swagger`

- [ ] Testar GET /api/produtos
  - [ ] Verificar retorno dos produtos seed

- [ ] Testar GET /api/produtos/{id}
  - [ ] Buscar produto existente
  - [ ] Buscar produto inexistente (404)

- [ ] Testar POST /api/produtos
  - [ ] Criar produto válido
  - [ ] Tentar criar com código duplicado (400)
  - [ ] Criar com dados inválidos (validação)

- [ ] Testar PUT /api/produtos/{id}
  - [ ] Atualizar produto existente
  - [ ] Tentar atualizar inexistente (404)

- [ ] Testar DELETE /api/produtos/{id}
  - [ ] Deletar produto não usado
  - [ ] Tentar deletar usado (400)

---

## 🏗️ FASE 2 - ESTRUTURAS (BOM) (Semanas 2-3)

---

### 📐 FASE 2.1 - Models de Estrutura

#### **Objetivo:** Criar models para estrutura de produtos hierárquica

---

#### 2.1.1 - Criar Model EstruturaProduto
- [ ] Criar `Models/EstruturaProduto.cs`
  ```csharp
  using System.ComponentModel.DataAnnotations;

  namespace ArjSys.Api.Models;

  public class EstruturaProduto
  {
      [Key]
      public Guid Id { get; set; } = Guid.NewGuid();

      [Required]
      public Guid ProdutoPaiId { get; set; }

      public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

      public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

      // Navegação
      public virtual Produto ProdutoPai { get; set; } = null!;
      public virtual ICollection<ComponenteBOM> Componentes { get; set; } = new List<ComponenteBOM>();
  }
  ```

---

#### 2.1.2 - Criar Model ComponenteBOM
- [ ] Criar `Models/ComponenteBOM.cs`
  ```csharp
  using System.ComponentModel.DataAnnotations;

  namespace ArjSys.Api.Models;

  public class ComponenteBOM
  {
      [Key]
      public Guid Id { get; set; } = Guid.NewGuid();

      [Required]
      public Guid EstruturaId { get; set; }

      [Required]
      public Guid ProdutoFilhoId { get; set; }

      public int Nivel { get; set; } // 1, 2, 3...

      [Required]
      [MaxLength(10)]
      public string Ordenacao { get; set; } = string.Empty; // 0010, 0020...

      public decimal Quantidade { get; set; }

      public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

      // Navegação
      public virtual EstruturaProduto Estrutura { get; set; } = null!;
      public virtual Produto ProdutoFilho { get; set; } = null!;
  }
  ```

---

#### 2.1.3 - Atualizar DbContext
- [ ] Adicionar configurações no `OnModelCreating`
  ```csharp
  // EstruturaProduto
  modelBuilder.Entity<EstruturaProduto>(entity =>
  {
      entity.HasKey(e => e.Id);
      
      entity.HasOne(e => e.ProdutoPai)
          .WithMany()
          .HasForeignKey(e => e.ProdutoPaiId)
          .OnDelete(DeleteBehavior.Restrict);

      entity.HasIndex(e => e.ProdutoPaiId).IsUnique();
  });

  // ComponenteBOM
  modelBuilder.Entity<ComponenteBOM>(entity =>
  {
      entity.HasKey(e => e.Id);

      entity.HasOne(e => e.Estrutura)
          .WithMany(e => e.Componentes)
          .HasForeignKey(e => e.EstruturaId)
          .OnDelete(DeleteBehavior.Cascade);

      entity.HasOne(e => e.ProdutoFilho)
          .WithMany(p => p.ComponentesComoFilho)
          .HasForeignKey(e => e.ProdutoFilhoId)
          .OnDelete(DeleteBehavior.Restrict);

      entity.Property(e => e.Quantidade).HasPrecision(10, 2);

      entity.HasIndex(e => new { e.EstruturaId, e.ProdutoFilhoId, e.Nivel, e.Ordenacao })
          .IsUnique();
  });
  ```

- [ ] Criar e aplicar migration
  ```bash
  dotnet ef migrations add AddEstruturaProduto
  dotnet ef database update
  ```

---

### 📋 FASE 2.2 - DTOs e Endpoints de Estrutura

#### **Objetivo:** CRUD completo de estruturas de produtos

---

#### 2.2.1 - Criar DTOs
- [ ] `DTOs/EstruturaDto.cs`
  ```csharp
  namespace ArjSys.Api.DTOs;

  public record EstruturaDto(
      Guid Id,
      Guid ProdutoPaiId,
      ProdutoDto ProdutoPai,
      List<ComponenteBOMDto> Componentes,
      decimal PesoTotal,
      int TempoTotal,
      DateTime CreatedAt,
      DateTime UpdatedAt
  );
  ```

- [ ] `DTOs/ComponenteBOMDto.cs`
  ```csharp
  namespace ArjSys.Api.DTOs;

  public record ComponenteBOMDto(
      Guid Id,
      Guid ProdutoFilhoId,
      ProdutoDto ProdutoFilho,
      int Nivel,
      string Ordenacao,
      decimal Quantidade
  );
  ```

- [ ] `DTOs/CreateEstruturaDto.cs`
  ```csharp
  namespace ArjSys.Api.DTOs;

  public record CreateEstruturaDto(
      Guid ProdutoPaiId
  );
  ```

- [ ] `DTOs/AddComponenteDto.cs`
  ```csharp
  namespace ArjSys.Api.DTOs;

  public record AddComponenteDto(
      Guid ProdutoFilhoId,
      int Nivel,
      string Ordenacao,
      decimal Quantidade
  );
  ```

---

#### 2.2.2 - Atualizar AutoMapper
- [ ] Adicionar mappings em `MappingProfile.cs`
  ```csharp
  CreateMap<EstruturaProduto, EstruturaDto>()
      .ForMember(dest => dest.PesoTotal, opt => opt.MapFrom(src => CalcularPesoTotal(src)))
      .ForMember(dest => dest.TempoTotal, opt => opt.MapFrom(src => CalcularTempoTotal(src)));

  CreateMap<ComponenteBOM, ComponenteBOMDto>();
  CreateMap<AddComponenteDto, ComponenteBOM>();
  ```

- [ ] Implementar funções de cálculo (private no profile)

---

#### 2.2.3 - Criar Serviço de Validação Circular
- [ ] Criar `Services/EstruturaValidationService.cs`
  ```csharp
  namespace ArjSys.Api.Services;

  public class EstruturaValidationService
  {
      private readonly AppDbContext _db;

      public EstruturaValidationService(AppDbContext db)
      {
          _db = db;
      }

      public async Task<bool> ValidarReferenciaCircular(Guid produtoPaiId, Guid produtoFilhoId)
      {
          // Verifica se produtoFilho já tem uma estrutura que contém produtoPai
          // Implementar busca recursiva
          var estruturaFilho = await _db.Estruturas
              .Include(e => e.Componentes)
              .ThenInclude(c => c.ProdutoFilho)
              .FirstOrDefaultAsync(e => e.ProdutoPaiId == produtoFilhoId);

          if (estruturaFilho == null) return true; // OK

          // Recursão para verificar se produtoPaiId está na árvore abaixo
          return !await ContemProdutoNaArvore(estruturaFilho, produtoPaiId);
      }

      private async Task<bool> ContemProdutoNaArvore(EstruturaProduto estrutura, Guid produtoId)
      {
          foreach (var componente in estrutura.Componentes)
          {
              if (componente.ProdutoFilhoId == produtoId) return true;

              var subEstrutura = await _db.Estruturas
                  .Include(e => e.Componentes)
                  .FirstOrDefaultAsync(e => e.ProdutoPaiId == componente.ProdutoFilhoId);

              if (subEstrutura != null && await ContemProdutoNaArvore(subEstrutura, produtoId))
              {
                  return true;
              }
          }

          return false;
      }
  }
  ```

- [ ] Registrar no Program.cs
  ```csharp
  builder.Services.AddScoped<EstruturaValidationService>();
  ```

---

#### 2.2.4 - Criar Endpoints de Estrutura
- [ ] Criar `Endpoints/EstruturasEndpoints.cs`
  ```csharp
  namespace ArjSys.Api.Endpoints;

  public static class EstruturasEndpoints
  {
      public static void MapEstruturasEndpoints(this WebApplication app)
      {
          var group = app.MapGroup("/api/estruturas").WithTags("Estruturas");

          // GET /api/estruturas
          group.MapGet("/", async (AppDbContext db, IMapper mapper) =>
          {
              var estruturas = await db.Estruturas
                  .Include(e => e.ProdutoPai)
                  .Include(e => e.Componentes)
                      .ThenInclude(c => c.ProdutoFilho)
                  .ToListAsync();

              return Results.Ok(mapper.Map<List<EstruturaDto>>(estruturas));
          });

          // GET /api/estruturas/produto/{produtoId}
          group.MapGet("/produto/{produtoId:guid}", async (Guid produtoId, AppDbContext db, IMapper mapper) =>
          {
              var estrutura = await db.Estruturas
                  .Include(e => e.ProdutoPai)
                  .Include(e => e.Componentes)
                      .ThenInclude(c => c.ProdutoFilho)
                  .FirstOrDefaultAsync(e => e.ProdutoPaiId == produtoId);

              return estrutura is null
                  ? Results.NotFound()
                  : Results.Ok(mapper.Map<EstruturaDto>(estrutura));
          });

          // POST /api/estruturas
          group.MapPost("/", async (CreateEstruturaDto dto, AppDbContext db, IMapper mapper) =>
          {
              // Verificar se produto existe
              var produto = await db.Produtos.FindAsync(dto.ProdutoPaiId);
              if (produto is null)
              {
                  return Results.BadRequest(new { message = "Produto pai não encontrado" });
              }

              // Verificar se já existe estrutura para este produto
              if (await db.Estruturas.AnyAsync(e => e.ProdutoPaiId == dto.ProdutoPaiId))
              {
                  return Results.BadRequest(new { message = "Produto já possui estrutura" });
              }

              var estrutura = new EstruturaProduto
              {
                  ProdutoPaiId = dto.ProdutoPaiId
              };

              db.Estruturas.Add(estrutura);
              await db.SaveChangesAsync();

              // Recarregar com includes
              estrutura = await db.Estruturas
                  .Include(e => e.ProdutoPai)
                  .Include(e => e.Componentes)
                  .FirstAsync(e => e.Id == estrutura.Id);

              return Results.Created($"/api/estruturas/{estrutura.Id}", mapper.Map<EstruturaDto>(estrutura));
          });

          // POST /api/estruturas/{id}/componentes
          group.MapPost("/{id:guid}/componentes", async (Guid id, AddComponenteDto dto, 
              AppDbContext db, IMapper mapper, EstruturaValidationService validationService) =>
          {
              var estrutura = await db.Estruturas.FindAsync(id);
              if (estrutura is null)
              {
                  return Results.NotFound();
              }

              // Validar referência circular
              if (!await validationService.ValidarReferenciaCircular(estrutura.ProdutoPaiId, dto.ProdutoFilhoId))
              {
                  return Results.BadRequest(new { message = "Referência circular detectada" });
              }

              var componente = mapper.Map<ComponenteBOM>(dto);
              componente.EstruturaId = id;

              db.ComponentesBOM.Add(componente);
              estrutura.UpdatedAt = DateTime.UtcNow;
              await db.SaveChangesAsync();

              return Results.Created($"/api/estruturas/{id}/componentes/{componente.Id}", 
                  mapper.Map<ComponenteBOMDto>(componente));
          });

          // PUT /api/estruturas/{id}/componentes/{componenteId}
          group.MapPut("/{id:guid}/componentes/{componenteId:guid}", 
              async (Guid id, Guid componenteId, AddComponenteDto dto, AppDbContext db) =>
          {
              var componente = await db.ComponentesBOM
                  .FirstOrDefaultAsync(c => c.Id == componenteId && c.EstruturaId == id);

              if (componente is null)
              {
                  return Results.NotFound();
              }

              componente.Nivel = dto.Nivel;
              componente.Ordenacao = dto.Ordenacao;
              componente.Quantidade = dto.Quantidade;

              await db.SaveChangesAsync();

              return Results.NoContent();
          });

          // DELETE /api/estruturas/{id}/componentes/{componenteId}
          group.MapDelete("/{id:guid}/componentes/{componenteId:guid}", 
              async (Guid id, Guid componenteId, AppDbContext db, bool cascadeDelete = false) =>
          {
              var componente = await db.ComponentesBOM
                  .FirstOrDefaultAsync(c => c.Id == componenteId && c.EstruturaId == id);

              if (componente is null)
              {
                  return Results.NotFound();
              }

              if (cascadeDelete)
              {
                  // Remover componente e todos os filhos recursivamente
                  await RemoverComponenteCascata(db, componente.ProdutoFilhoId);
              }

              db.ComponentesBOM.Remove(componente);
              await db.SaveChangesAsync();

              return Results.NoContent();
          });
      }

      private static async Task RemoverComponenteCascata(AppDbContext db, Guid produtoId)
      {
          var estruturaFilho = await db.Estruturas
              .Include(e => e.Componentes)
              .FirstOrDefaultAsync(e => e.ProdutoPaiId == produtoId);

          if (estruturaFilho != null)
          {
              foreach (var comp in estruturaFilho.Componentes)
              {
                  await RemoverComponenteCascata(db, comp.ProdutoFilhoId);
              }

              db.Estruturas.Remove(estruturaFilho);
          }
      }
  }
  ```

- [ ] Registrar no Program.cs
  ```csharp
  app.MapEstruturasEndpoints();
  ```

---

#### 2.2.5 - Testar Endpoints de Estrutura
- [ ] Criar estrutura
- [ ] Adicionar componentes
- [ ] Editar componente
- [ ] Remover componente (normal e cascade)
- [ ] Testar validação circular
- [ ] Buscar estrutura por produto

---

## 📄 FASE 3 - UPLOAD E DESENHOS (Semanas 3-4)

---

### 📤 FASE 3.1 - Serviço de Upload

#### **Objetivo:** Upload, storage e gerenciamento de arquivos de desenhos

---

#### 3.1.1 - Criar Serviço de Upload
- [ ] Criar `Services/UploadService.cs`
  ```csharp
  namespace ArjSys.Api.Services;

  public class UploadService
  {
      private readonly IConfiguration _config;
      private readonly string _basePath;
      private readonly long _maxFileSizeBytes;
      private readonly string[] _allowedExtensions;

      public UploadService(IConfiguration config)
      {
          _config = config;
          _basePath = config["FileStorage:BasePath"] ?? "./uploads";
          _maxFileSizeBytes = (config.GetValue<int>("FileStorage:MaxFileSizeMB") ?? 10) * 1024 * 1024;
          _allowedExtensions = config.GetSection("FileStorage:AllowedExtensions").Get<string[]>() 
              ?? new[] { ".pdf", ".dwg", ".dxf", ".png", ".jpg", ".jpeg" };

          // Criar pasta base se não existir
          if (!Directory.Exists(_basePath))
          {
              Directory.CreateDirectory(_basePath);
          }
      }

      public async Task<(bool Success, string? FilePath, string? Error)> UploadFileAsync(
          IFormFile file, string subfolder = "desenhos")
      {
          // Validar tamanho
          if (file.Length > _maxFileSizeBytes)
          {
              return (false, null, $"Arquivo muito grande. Máximo: {_maxFileSizeBytes / 1024 / 1024}MB");
          }

          // Validar extensão
          var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
          if (!_allowedExtensions.Contains(extension))
          {
              return (false, null, $"Tipo de arquivo não permitido: {extension}");
          }

          try
          {
              // Gerar nome único
              var fileName = $"{Guid.NewGuid()}{extension}";
              var folderPath = Path.Combine(_basePath, subfolder);

              if (!Directory.Exists(folderPath))
              {
                  Directory.CreateDirectory(folderPath);
              }

              var filePath = Path.Combine(folderPath, fileName);

              // Salvar arquivo
              using (var stream = new FileStream(filePath, FileMode.Create))
              {
                  await file.CopyToAsync(stream);
              }

              // Retornar caminho relativo
              var relativePath = Path.Combine(subfolder, fileName);

              return (true, relativePath, null);
          }
          catch (Exception ex)
          {
              return (false, null, $"Erro ao salvar arquivo: {ex.Message}");
          }
      }

      public bool DeleteFile(string relativePath)
      {
          try
          {
              var fullPath = Path.Combine(_basePath, relativePath);
              if (File.Exists(fullPath))
              {
                  File.Delete(fullPath);
                  return true;
              }
              return false;
          }
          catch
          {
              return false;
          }
      }

      public string GetFullPath(string relativePath)
      {
          return Path.Combine(_basePath, relativePath);
      }

      public bool FileExists(string relativePath)
      {
          var fullPath = Path.Combine(_basePath, relativePath);
          return File.Exists(fullPath);
      }
  }
  ```

- [ ] Registrar no Program.cs
  ```csharp
  builder.Services.AddSingleton<UploadService>();
  ```

---

#### 3.1.2 - Endpoint de Upload para Produto
- [ ] Adicionar em `ProdutosEndpoints.cs`
  ```csharp
  // POST /api/produtos/{id}/upload-desenho
  group.MapPost("/{id:guid}/upload-desenho", async (
      Guid id,
      IFormFile file,
      AppDbContext db,
      UploadService uploadService) =>
  {
      var produto = await db.Produtos.FindAsync(id);
      if (produto is null)
      {
          return Results.NotFound();
      }

      // Upload
      var (success, filePath, error) = await uploadService.UploadFileAsync(file, "desenhos");

      if (!success)
      {
          return Results.BadRequest(new { message = error });
      }

      // Deletar arquivo antigo se existir
      if (!string.IsNullOrEmpty(produto.CaminhoDesenho))
      {
          uploadService.DeleteFile(produto.CaminhoDesenho);
      }

      // Atualizar produto
      produto.CaminhoDesenho = filePath;
      produto.PossuiDesenho = true;
      produto.UpdatedAt = DateTime.UtcNow;

      await db.SaveChangesAsync();

      return Results.Ok(new { filePath });
  })
  .DisableAntiforgery() // Necessário para upload
  .Accepts<IFormFile>("multipart/form-data");
  ```

---

### 📥 FASE 3.2 - Endpoints de Desenhos

#### **Objetivo:** Listar, visualizar e fazer download de desenhos

---

#### 3.2.1 - Criar Endpoints de Desenhos
- [ ] Criar `Endpoints/DesenhosEndpoints.cs`
  ```csharp
  namespace ArjSys.Api.Endpoints;

  public static class DesenhosEndpoints
  {
      public static void MapDesenhosEndpoints(this WebApplication app)
      {
          var group = app.MapGroup("/api/desenhos").WithTags("Desenhos");

          // GET /api/desenhos - Listar produtos com desenhos
          group.MapGet("/", async (AppDbContext db, IMapper mapper, string? search, string? tipo) =>
          {
              var query = db.Produtos
                  .Where(p => p.PossuiDesenho && !string.IsNullOrEmpty(p.CaminhoDesenho));

              if (!string.IsNullOrEmpty(search))
              {
                  query = query.Where(p => 
                      p.Codigo.Contains(search) || 
                      p.DescricaoCurta.Contains(search));
              }

              if (!string.IsNullOrEmpty(tipo))
              {
                  query = query.Where(p => p.Tipo == tipo);
              }

              var produtos = await query.ToListAsync();

              return Results.Ok(mapper.Map<List<ProdutoDto>>(produtos));
          });

          // GET /api/desenhos/{id}/arquivo - Download do arquivo
          group.MapGet("/{id:guid}/arquivo", async (Guid id, AppDbContext db, UploadService uploadService) =>
          {
              var produto = await db.Produtos.FindAsync(id);
              
              if (produto is null || string.IsNullOrEmpty(produto.CaminhoDesenho))
              {
                  return Results.NotFound();
              }

              var fullPath = uploadService.GetFullPath(produto.CaminhoDesenho);

              if (!uploadService.FileExists(produto.CaminhoDesenho))
              {
                  return Results.NotFound(new { message = "Arquivo não encontrado no servidor" });
              }

              var contentType = GetContentType(produto.CaminhoDesenho);
              var fileName = $"{produto.Codigo}{Path.GetExtension(produto.CaminhoDesenho)}";

              return Results.File(fullPath, contentType, fileName);
          });

          // GET /api/desenhos/{id}/thumbnail - Thumbnail (simplificado)
          group.MapGet("/{id:guid}/thumbnail", async (Guid id, AppDbContext db, UploadService uploadService) =>
          {
              // TODO: Implementar geração real de thumbnail
              // Por enquanto, retornar arquivo original se for imagem, placeholder se não
              var produto = await db.Produtos.FindAsync(id);
              
              if (produto is null || string.IsNullOrEmpty(produto.CaminhoDesenho))
              {
                  return Results.NotFound();
              }

              var ext = Path.GetExtension(produto.CaminhoDesenho).ToLowerInvariant();
              
              if (new[] { ".png", ".jpg", ".jpeg" }.Contains(ext))
              {
                  var fullPath = uploadService.GetFullPath(produto.CaminhoDesenho);
                  return Results.File(fullPath, GetContentType(produto.CaminhoDesenho));
              }

              // Placeholder para PDF/DWG/DXF
              return Results.NotFound(new { message = "Thumbnail não disponível" });
          });
      }

      private static string GetContentType(string path)
      {
          var ext = Path.GetExtension(path).ToLowerInvariant();
          return ext switch
          {
              ".pdf" => "application/pdf",
              ".dwg" => "application/acad",
              ".dxf" => "application/dxf",
              ".png" => "image/png",
              ".jpg" or ".jpeg" => "image/jpeg",
              _ => "application/octet-stream"
          };
      }
  }
  ```

- [ ] Registrar no Program.cs
  ```csharp
  app.MapDesenhosEndpoints();
  ```

---

#### 3.2.2 - Configurar Servir Arquivos Estáticos (opcional)
- [ ] No Program.cs
  ```csharp
  // Permitir acesso direto aos uploads (se desejar)
  app.UseStaticFiles(new StaticFileOptions
  {
      FileProvider = new PhysicalFileProvider(
          Path.Combine(builder.Environment.ContentRootPath, "uploads")),
      RequestPath = "/uploads"
  });
  ```

---

#### 3.2.3 - Testar Uploads e Downloads
- [ ] Upload de PDF
- [ ] Upload de imagem
- [ ] Upload de DWG/DXF
- [ ] Download de arquivo
- [ ] Validar tamanho máximo
- [ ] Validar tipo de arquivo

---

## 👥 FASE 4 - CLIENTES E PEDIDOS (Semanas 4-5)

---

### 🧑‍💼 FASE 4.1 - Model e CRUD de Clientes

#### **Objetivo:** Cadastro de clientes

---

#### 4.1.1 - Criar Model Cliente
- [ ] `Models/Cliente.cs`
  ```csharp
  namespace ArjSys.Api.Models;

  public class Cliente
  {
      [Key]
      public Guid Id { get; set; } = Guid.NewGuid();

      [Required]
      [MaxLength(200)]
      public string RazaoSocial { get; set; } = string.Empty;

      [MaxLength(200)]
      public string? NomeFantasia { get; set; }

      [Required]
      [MaxLength(20)]
      public string CnpjCpf { get; set; } = string.Empty;

      [MaxLength(20)]
      public string? Telefone { get; set; }

      [MaxLength(200)]
      public string? Email { get; set; }

      [MaxLength(100)]
      public string? Cidade { get; set; }

      [MaxLength(2)]
      public string? Estado { get; set; }

      public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

      public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

      // Navegação
      public virtual ICollection<Pedido> Pedidos { get; set; } = new List<Pedido>();
  }
  ```

---

#### 4.1.2 - DTOs, AutoMapper, Validators
- [ ] Criar DTOs (ClienteDto, CreateClienteDto, UpdateClienteDto)
- [ ] Atualizar MappingProfile
- [ ] Criar ClienteValidator (validar CNPJ/CPF)

---

#### 4.1.3 - Endpoints de Cliente
- [ ] Criar `Endpoints/ClientesEndpoints.cs`
  - [ ] GET /api/clientes
  - [ ] GET /api/clientes/{id}
  - [ ] POST /api/clientes
  - [ ] PUT /api/clientes/{id}
  - [ ] DELETE /api/clientes/{id}

- [ ] Registrar no Program.cs

---

#### 4.1.4 - Migration e Testes
- [ ] Migration AddCliente
- [ ] Seed de clientes
- [ ] Testar CRUD completo

---

### 📋 FASE 4.2 - Model e CRUD de Pedidos

#### **Objetivo:** Lançamento e gestão de pedidos

---

#### 4.2.1 - Criar Model Pedido
- [ ] `Models/Pedido.cs`
  ```csharp
  namespace ArjSys.Api.Models;

  public class Pedido
  {
      [Key]
      public Guid Id { get; set; } = Guid.NewGuid();

      [Required]
      [MaxLength(50)]
      public string Numero { get; set; } = string.Empty; // PED-2025-001

      [Required]
      public Guid ClienteId { get; set; }

      [Required]
      public Guid ProdutoId { get; set; }

      public decimal Quantidade { get; set; }

      public DateTime DataLancamento { get; set; } = DateTime.UtcNow;

      public DateTime DataEntregaPrevista { get; set; }

      [Required]
      [MaxLength(20)]
      public string Status { get; set; } = "ORCAMENTO"; // ORCAMENTO, APROVADO, EM_PRODUCAO, CONCLUIDO, CANCELADO

      [MaxLength(1000)]
      public string? Observacoes { get; set; }

      // Campos calculados (podem ser armazenados ou calculados sob demanda)
      public int? TempoTotalProducao { get; set; }
      public decimal? PesoTotal { get; set; }

      public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
      public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

      // Navegação
      public virtual Cliente Cliente { get; set; } = null!;
      public virtual Produto Produto { get; set; } = null!;
  }
  ```

---

#### 4.2.2 - DTOs e Validators
- [ ] PedidoDto, CreatePedidoDto, UpdatePedidoDto
- [ ] AlterarStatusDto
- [ ] PedidoValidator (data futura, quantidade > 0)

---

#### 4.2.3 - Serviço de Geração de Número
- [ ] `Services/PedidoNumberService.cs`
  ```csharp
  public class PedidoNumberService
  {
      private readonly AppDbContext _db;

      public async Task<string> GenerateNextNumberAsync()
      {
          var year = DateTime.Now.Year;
          var prefix = $"PED-{year}-";

          var lastNumber = await _db.Pedidos
              .Where(p => p.Numero.StartsWith(prefix))
              .OrderByDescending(p => p.Numero)
              .Select(p => p.Numero)
              .FirstOrDefaultAsync();

          if (lastNumber == null)
          {
              return $"{prefix}001";
          }

          var lastSequence = int.Parse(lastNumber.Substring(prefix.Length));
          var nextSequence = lastSequence + 1;

          return $"{prefix}{nextSequence:D3}";
      }
  }
  ```

- [ ] Registrar no Program.cs

---

#### 4.2.4 - Endpoints de Pedidos
- [ ] `Endpoints/PedidosEndpoints.cs`
  - [ ] GET /api/pedidos (com filtros)
  - [ ] GET /api/pedidos/{id}
  - [ ] POST /api/pedidos (gerar número automaticamente)
  - [ ] PUT /api/pedidos/{id}
  - [ ] PATCH /api/pedidos/{id}/status (alterar status)
  - [ ] DELETE /api/pedidos/{id} (cancelar)

---

#### 4.2.5 - Migration e Testes
- [ ] Migration AddPedido
- [ ] Seed de pedidos
- [ ] Testar CRUD
- [ ] Testar alteração de status

---

## 📊 FASE 5 - EXPLOSÃO BOM + RELATÓRIOS (Semanas 5-6)

---

### 🧮 FASE 5.1 - Serviço de Explosão de Materiais

#### **Objetivo:** Cálculo recursivo de materiais necessários

---

#### 5.1.1 - Criar Service
- [ ] `Services/ExplosaoMaterialService.cs`
  ```csharp
  namespace ArjSys.Api.Services;

  public class ExplosaoMaterialService
  {
      private readonly AppDbContext _db;

      public async Task<ExplosaoResult> CalcularExplosao(Guid produtoId, decimal quantidade)
      {
          var materiais = new Dictionary<Guid, MaterialExplosao>();

          await ExplodirRecursivo(produtoId, quantidade, materiais);

          var result = new ExplosaoResult
          {
              MateriaisComprados = materiais.Values
                  .Where(m => m.Tipo == "COMPRADO")
                  .OrderBy(m => m.Codigo)
                  .ToList(),

              MateriaisFabricados = materiais.Values
                  .Where(m => m.Tipo == "FABRICADO")
                  .OrderBy(m => m.Codigo)
                  .ToList(),

              MateriasPrimas = materiais.Values
                  .Where(m => m.Tipo == "MATERIA_PRIMA")
                  .OrderBy(m => m.Codigo)
                  .ToList(),

              PesoTotal = materiais.Values.Sum(m => (m.PesoUnitario ?? 0) * m.QuantidadeTotal),
              TempoTotal = materiais.Values
                  .Where(m => m.Tipo == "FABRICADO")
                  .Sum(m => (m.TempoFabricacao ?? 0) * m.QuantidadeTotal),
              TotalItens = materiais.Count
          };

          return result;
      }

      private async Task ExplodirRecursivo(
          Guid produtoId, 
          decimal quantidade, 
          Dictionary<Guid, MaterialExplosao> materiais)
      {
          // Buscar produto
          var produto = await _db.Produtos.FindAsync(produtoId);
          if (produto == null) return;

          // Buscar estrutura
          var estrutura = await _db.Estruturas
              .Include(e => e.Componentes)
              .ThenInclude(c => c.ProdutoFilho)
              .FirstOrDefaultAsync(e => e.ProdutoPaiId == produtoId);

          if (estrutura == null || !estrutura.Componentes.Any())
          {
              // Produto sem estrutura = material
              if (materiais.ContainsKey(produtoId))
              {
                  materiais[produtoId].QuantidadeTotal += quantidade;
              }
              else
              {
                  materiais[produtoId] = new MaterialExplosao
                  {
                      ProdutoId = produtoId,
                      Codigo = produto.Codigo,
                      Descricao = produto.DescricaoCurta,
                      QuantidadeTotal = quantidade,
                      Unidade = produto.Unidade,
                      Tipo = produto.Tipo,
                      PesoUnitario = produto.PesoEstimado,
                      TempoFabricacao = produto.TempoFabricacao
                  };
              }
          }
          else
          {
              // Explodir componentes recursivamente
              foreach (var componente in estrutura.Componentes)
              {
                  var qtdeFilho = componente.Quantidade * quantidade;
                  await ExplodirRecursivo(componente.ProdutoFilhoId, qtdeFilho, materiais);
              }
          }
      }
  }

  public class ExplosaoResult
  {
      public List<MaterialExplosao> MateriaisComprados { get; set; } = new();
      public List<MaterialExplosao> MateriaisFabricados { get; set; } = new();
      public List<MaterialExplosao> MateriasPrimas { get; set; } = new();
      public decimal PesoTotal { get; set; }
      public int TempoTotal { get; set; }
      public int TotalItens { get; set; }
  }

  public class MaterialExplosao
  {
      public Guid ProdutoId { get; set; }
      public string Codigo { get; set; } = string.Empty;
      public string Descricao { get; set; } = string.Empty;
      public decimal QuantidadeTotal { get; set; }
      public string Unidade { get; set; } = string.Empty;
      public string Tipo { get; set; } = string.Empty;
      public decimal? PesoUnitario { get; set; }
      public int? TempoFabricacao { get; set; }
  }
  ```

- [ ] Registrar no Program.cs
  ```csharp
  builder.Services.AddScoped<ExplosaoMaterialService>();
  ```

---

#### 5.1.2 - Endpoint de Explosão
- [ ] Criar `Endpoints/RelatoriosEndpoints.cs`
  ```csharp
  public static void MapRelatoriosEndpoints(this WebApplication app)
  {
      var group = app.MapGroup("/api/relatorios").WithTags("Relatórios");

      // POST /api/relatorios/explosao-materiais
      group.MapPost("/explosao-materiais", async (
          ExplosaoRequest request,
          AppDbContext db,
          ExplosaoMaterialService explosaoService) =>
      {
          Guid produtoId;
          decimal quantidade;

          if (request.PedidoId.HasValue)
          {
              var pedido = await db.Pedidos.FindAsync(request.PedidoId.Value);
              if (pedido == null) return Results.NotFound();

              produtoId = pedido.ProdutoId;
              quantidade = pedido.Quantidade;
          }
          else if (request.ProdutoId.HasValue && request.Quantidade.HasValue)
          {
              produtoId = request.ProdutoId.Value;
              quantidade = request.Quantidade.Value;
          }
          else
          {
              return Results.BadRequest(new { message = "Informe PedidoId ou (ProdutoId + Quantidade)" });
          }

          var resultado = await explosaoService.CalcularExplosao(produtoId, quantidade);

          return Results.Ok(resultado);
      });
  }

  public record ExplosaoRequest(
      Guid? PedidoId,
      Guid? ProdutoId,
      decimal? Quantidade
  );
  ```

- [ ] Registrar no Program.cs

---

#### 5.1.3 - Testar Explosão
- [ ] Criar estrutura complexa (3+ níveis)
- [ ] Calcular explosão
- [ ] Verificar totalização correta
- [ ] Testar com diferentes quantidades

---

## 📈 FASE 6 - DASHBOARD + QUERIES (Semanas 6-7)

---

### 📊 FASE 6.1 - Endpoints de Métricas

#### **Objetivo:** Dados para dashboard

---

#### 6.1.1 - Criar Endpoints
- [ ] `Endpoints/DashboardEndpoints.cs`
  ```csharp
  public static void MapDashboardEndpoints(this WebApplication app)
  {
      var group = app.MapGroup("/api/dashboard").WithTags("Dashboard");

      // GET /api/dashboard/metricas
      group.MapGet("/metricas", async (AppDbContext db) =>
      {
          var totalProdutos = await db.Produtos.CountAsync();
          var totalClientes = await db.Clientes.CountAsync();
          var totalPedidos = await db.Pedidos.CountAsync();
          
          var pedidosAtivos = await db.Pedidos
              .CountAsync(p => p.Status == "APROVADO" || p.Status == "EM_PRODUCAO");

          var pedidosEmProducao = await db.Pedidos
              .CountAsync(p => p.Status == "EM_PRODUCAO");

          var pedidosProximosPrazo = await db.Pedidos
              .Where(p => p.Status != "CONCLUIDO" && p.Status != "CANCELADO")
              .CountAsync(p => p.DataEntregaPrevista <= DateTime.UtcNow.AddDays(7));

          return Results.Ok(new
          {
              totalProdutos,
              totalClientes,
              totalPedidos,
              pedidosAtivos,
              pedidosEmProducao,
              pedidosProximosPrazo
          });
      });

      // GET /api/dashboard/pedidos-por-status
      group.MapGet("/pedidos-por-status", async (AppDbContext db) =>
      {
          var porStatus = await db.Pedidos
              .GroupBy(p => p.Status)
              .Select(g => new { Status = g.Key, Total = g.Count() })
              .ToListAsync();

          return Results.Ok(porStatus);
      });

      // GET /api/dashboard/ultimos-pedidos
      group.MapGet("/ultimos-pedidos", async (AppDbContext db, IMapper mapper, int n = 10) =>
      {
          var pedidos = await db.Pedidos
              .Include(p => p.Cliente)
              .Include(p => p.Produto)
              .OrderByDescending(p => p.DataLancamento)
              .Take(n)
              .ToListAsync();

          return Results.Ok(mapper.Map<List<PedidoDto>>(pedidos));
      });
  }
  ```

---

## 🔐 FASE 7 - AUTENTICAÇÃO (Semanas 7-8)

---

### 🔑 FASE 7.1 - JWT Authentication

#### **Objetivo:** Login e proteção de endpoints

---

#### 7.1.1 - Model Usuario
- [ ] Criar `Models/Usuario.cs`
- [ ] Hash de senha (BCrypt)

#### 7.1.2 - Serviço de Token
- [ ] `Services/TokenService.cs`
- [ ] Gerar JWT

#### 7.1.3 - Endpoints de Auth
- [ ] POST /api/auth/login
- [ ] POST /api/auth/register (opcional)

#### 7.1.4 - Proteger Endpoints
- [ ] Adicionar `[Authorize]` onde necessário
- [ ] Configurar JWT no Program.cs

---

## 🧪 FASE 8 - TESTES E DEPLOY (Semana 8)

---

### ✅ FASE 8.1 - Testes

- [ ] Testes unitários (ExplosaoMaterialService)
- [ ] Testes de integração (principais endpoints)
- [ ] Postman collection

### 🐳 FASE 8.2 - Docker

- [ ] Dockerfile
- [ ] docker-compose.yml (API + SQL Server)

### 🚀 FASE 8.3 - Deploy

- [ ] Azure App Service OU
- [ ] Railway / Render (free tier)

---

## ✅ CHECKLIST FINAL BACKEND

- [ ] ✅ CRUD Produtos completo
- [ ] ✅ CRUD Estruturas (BOM) completo
- [ ] ✅ Upload de desenhos funcional
- [ ] ✅ CRUD Clientes
- [ ] ✅ CRUD Pedidos
- [ ] ✅ Explosão de materiais recursiva
- [ ] ✅ Endpoints de relatórios
- [ ] ✅ Endpoints de dashboard
- [ ] ✅ Autenticação JWT
- [ ] ✅ Validações implementadas
- [ ] ✅ Migrations aplicadas
- [ ] ✅ Seed data
- [ ] ✅ Swagger documentado
- [ ] ✅ CORS configurado
- [ ] ✅ Error handling
- [ ] ✅ Testes básicos
- [ ] ✅ Docker ready
- [ ] ✅ Deploy realizado

---

**Última atualização:** 20/01/2025
**Status:** 📋 Pronto para implementação
**Próximo passo:** Iniciar Fase 1.1 - Setup Projeto
