using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;

namespace api.Models;

public partial class EquipmentBorrowingV2Context : DbContext
{
    public EquipmentBorrowingV2Context()
    {
    }

    public EquipmentBorrowingV2Context(DbContextOptions<EquipmentBorrowingV2Context> options)
        : base(options)
    {
    }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Classification> Classifications { get; set; }

    public virtual DbSet<Instance> Instances { get; set; }

    public virtual DbSet<RequisitionRequest> RequisitionRequests { get; set; }

    public virtual DbSet<RequisitionReturn> RequisitionReturns { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseMySql("server=localhost;port=3306;database=equipmentBorrowingV2;user=root;password=TadPhi@2276", Microsoft.EntityFrameworkCore.ServerVersion.Parse("8.2.0-mysql"));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_0900_ai_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PRIMARY");

            entity.Property(e => e.Description).HasMaxLength(250);
            entity.Property(e => e.Name).HasMaxLength(50);
        });

        modelBuilder.Entity<Classification>(entity =>
        {
            entity.HasKey(e => e.ClassificationId).HasName("PRIMARY");

            entity.HasIndex(e => e.CategoryId, "FK_Classifications_CategoryId");

            entity.Property(e => e.Description).HasMaxLength(250);
            entity.Property(e => e.Name).HasMaxLength(50);

            entity.HasOne(d => d.Category).WithMany(p => p.Classifications)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Classifications_CategoryId");
        });

        modelBuilder.Entity<Instance>(entity =>
        {
            entity.HasKey(e => e.InstanceId).HasName("PRIMARY");

            entity.HasIndex(e => e.ClassificationId, "FK_Instances_ClassificationId");

            entity.Property(e => e.AssetId).HasMaxLength(50);

            entity.HasOne(d => d.Classification).WithMany(p => p.Instances)
                .HasForeignKey(d => d.ClassificationId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Instances_ClassificationId");
        });

        modelBuilder.Entity<RequisitionRequest>(entity =>
        {
            entity.HasKey(e => e.RequestId).HasName("PRIMARY");

            entity.HasIndex(e => e.CategoryId, "FK_RequisitionRequests_CategoryId");

            entity.HasIndex(e => e.InstanceId, "FK_RequisitionRequests_InstaceId");

            entity.HasIndex(e => e.ResponsibleId, "FK_RequisitionRequests_ResponsibleId");

            entity.HasIndex(e => e.RequesterId, "FK_RequisitionRequests_UserId");

            entity.Property(e => e.ReasonRejected).HasMaxLength(250);
            entity.Property(e => e.ReasonRequest).HasMaxLength(250);
            entity.Property(e => e.Requirement).HasMaxLength(250);

            entity.HasOne(d => d.Category).WithMany(p => p.RequisitionRequests)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_RequisitionRequests_CategoryId");

            entity.HasOne(d => d.Instance).WithMany(p => p.RequisitionRequests)
                .HasForeignKey(d => d.InstanceId)
                .HasConstraintName("FK_RequisitionRequests_InstaceId");

            entity.HasOne(d => d.Requester).WithMany(p => p.RequisitionRequestRequesters)
                .HasForeignKey(d => d.RequesterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_RequisitionRequests_UserId");

            entity.HasOne(d => d.Responsible).WithMany(p => p.RequisitionRequestResponsibles)
                .HasForeignKey(d => d.ResponsibleId)
                .HasConstraintName("FK_RequisitionRequests_ResponsibleId");
        });

        modelBuilder.Entity<RequisitionReturn>(entity =>
        {
            entity.HasKey(e => e.ReturnId).HasName("PRIMARY");

            entity.HasIndex(e => e.RequestId, "FK_RequisitionReturns_RequestId");

            entity.HasIndex(e => e.ResponsibleId, "FK_RequisitionReturns_ResponsibleId");

            entity.Property(e => e.ReasonReturn).HasMaxLength(250);

            entity.HasOne(d => d.Request).WithMany(p => p.RequisitionReturns)
                .HasForeignKey(d => d.RequestId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_RequisitionReturns_RequestId");

            entity.HasOne(d => d.Responsible).WithMany(p => p.RequisitionReturns)
                .HasForeignKey(d => d.ResponsibleId)
                .HasConstraintName("FK_RequisitionReturns_ResponsibleId");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PRIMARY");

            entity.Property(e => e.SubjectId).HasMaxLength(50);
            entity.Property(e => e.Username)
                .HasMaxLength(50)
                .UseCollation("utf8mb4_bin");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
