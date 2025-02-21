using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.ViewModels
{
    public enum InstanceStatus
    {
        Available,
        EndOfLife,
        Missing
    }

    public enum TimelineStatusChange
    {
        Add,
        Request,
        Return,
        Recall,
        EndOfLife,
        Missing
    }

    public class CategoryResponse
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string Description { get; set; }
        public string Unit { get; set; }
        public int ReservedQuantity { get; set; }
    }

    public class ClassificationResponse
    {
        public int CategoryId { get; set; }
        public int ClassificationId { get; set; }
        public string CategoryName { get; set; }
        public string ClassificationName { get; set; }
        public string Description { get; set; }
    }

    public class InstanceResponse
    {
        public int InstanceId { get; set; }
        public string CategoryName { get; set; }
        public string ClassificationName { get; set; }
        public string AssetId { get; set; }
        public int? Price { get; set; }
        public DateOnly? AcquisitonDate { get; set; }
        public string? StoreName { get; set; }
        public bool Preparation { get; set; }
    }

    public class CreateCategoryRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Unit { get; set; }
        public int ReservedQuantity { get; set; }
    }
    public class CreateClassificationRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int CategoryId { get; set; }
    }

    public class CreateInstanceRequest
    {
        public string AssetId { get; set; }
        public int ClassificationId { get; set; }
        public int Price { get; set; }
        public DateOnly AcquisitonDate { get; set; }
        public string StoreName { get; set; }
        public bool Preparation { get; set; }
    }

    public class UpdateCategoryRequest
    {
        public int CategoryId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Unit { get; set; }
        public int ReservedQuantity { get; set; }
    }

    public class UpdateClassificationRequest
    {
        public int ClassificationId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }

    public class UpdateInstanceRequest
    {
        public int InstanceId { get; set; }
        public int Price { get; set; }
        public string StoreName { get; set; }
        public bool Preparation { get; set; }
    }

    public class DeleteCategoryRequest
    {
        public int CategoryId { get; set; }
    }

    public class DeleteClassificationRequest
    {
        public int ClassificationId { get; set; }
    }

    public class DeleteInstanceRequest
    {
        public int InstanceId { get; set; }
    }

    public class GetAssetIdResponse
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string ClassificationName { get; set; }
        public string AssetId { get; set; }
        public int? UserId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public int InstanceId { get; set; }
        public int Status { get; set; }
        public DateOnly? AcquisitonDate { get; set; }
    }
    public class GetAssetIdByIdResponse
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string CategoryDescription { get; set; }
        public string ClassificationName { get; set; }
        public string ClassificationDescription { get; set; }
        public string AssetId { get; set; }
        public int? UserId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public int InstanceId { get; set; }
        public int Status { get; set; }
        public DateOnly? AcquisitonDate { get; set; }
        public string? StoreName { get; set; }
        public int? Price { get; set; }
        public bool Preparation { get; set; }
    }

    public class SetAssetIdRequest
    {
        public int InstanceId { get; set; }
        public InstanceStatus Status { get; set; }
    }

    public class CountInstanceResponse
    {
        public string CategoryName { get; set; }
        public int ReservedQuantity { get; set; }
        public int TotalInstances { get; set; }
        public int TotalInUsed { get; set; }
    }

    public class ProportionOfAssetResponse
    {
        public string CategoryName { get; set; }
        public double ReservedCount { get; set; }
        public double OverReservedCount { get; set; }
        public double TotalInUsed { get; set; }
    }

    public class GetAssetIdRequest
    {
        public int PageSize { get; set; }
        public int? PreviousCursor { get; set; }
        public int? NextCursor { get; set; }
        public string? AssetId { get; set; }
        public int? UserId { get; set; }
        public int? CategoryId { get; set; }
        public int? Status { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }

    public class GetCategoryRequest
    {
        public int PageSize { get; set; }
        public int? PreviousCursor { get; set; }
        public int? NextCursor { get; set; }
    }

    public class GetClassificationRequest
    {
        public int PageSize { get; set; }
        public int? PreviousCursor { get; set; }
        public int? NextCursor { get; set; }
        public int? CategoryId { get; set; }
    }

    public class GetInstancRequest
    {
        public int PageSize { get; set; }
        public int? PreviousCursor { get; set; }
        public int? NextCursor { get; set; }
    }

    public class HistoryResponse
    {
        public string CategoryName { get; set; }
        public string ClassificationName { get; set; }
        public string AssetId { get; set; }
        public DateTime CreateAt { get; set; }
        public List<HistoryItem> RequestList { get; set; } = new List<HistoryItem>();
        public DateTime? EndAt { get; set; }
    }

    public class HistoryItem
    {
        public int RequestId { get; set; }
        public DateTime? RequestAt { get; set; }
        public DateTime? ResponseAt { get; set; }
        public int? ReturnId { get; set; }
        public DateTime? ReturnAt { get; set; }
    }

    public class GetBackupEfficiencyRequest
    {
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }

    public class GetProportionOfAssetRequest
    {
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }

    public class GetTimetoAllocateRequest
    {
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }

    public class GetLifespanRequest
    {
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }
}