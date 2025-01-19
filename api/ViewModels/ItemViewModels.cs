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

    public class CreateCategoryRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
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
    }

    public class UpdateCategoryRequest
    {
        public int CategoryId { get; set; }
        public string Name { get; set; }
        public string Description { get; set;}
    }

    public class UpdateClassificationRequest
    {
        public int ClassificationId { get; set; }
        public string Name { get; set; }
        public string Description { get; set;}
    }

    public class UpdateInstanceRequest
    {
        public int InstanceId { get; set; }
        public string AssetId { get; set; }
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
}