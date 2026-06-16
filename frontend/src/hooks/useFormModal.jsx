import { useState, useCallback } from "react";

export default function useFormModal(initialState) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState(initialState);

    const openModal = useCallback((dataToEdit = null) => {
        setFormData(dataToEdit ? { ...initialState, ...dataToEdit } : initialState);
        setIsOpen(true);
    }, [initialState]);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setFormData(initialState);
    }, [initialState]);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }, []);

    return {
        isOpen,
        formData,
        setFormData,
        openModal,
        closeModal,
        handleChange,
    };
}
