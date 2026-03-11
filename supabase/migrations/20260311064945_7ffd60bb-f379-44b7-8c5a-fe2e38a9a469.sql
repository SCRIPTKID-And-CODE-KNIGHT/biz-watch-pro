
CREATE OR REPLACE FUNCTION public.record_sale(
  _product_id uuid,
  _quantity integer,
  _sold_by uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _product RECORD;
  _sale_id uuid;
BEGIN
  SELECT id, price, quantity INTO _product FROM public.products WHERE id = _product_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  IF _product.quantity < _quantity THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %', _product.quantity;
  END IF;
  
  INSERT INTO public.sales (product_id, quantity, total_amount, sold_by)
  VALUES (_product_id, _quantity, _product.price * _quantity, _sold_by)
  RETURNING id INTO _sale_id;
  
  UPDATE public.products SET quantity = quantity - _quantity WHERE id = _product_id;
  
  RETURN _sale_id;
END;
$$;
